'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BiLoaderCircle, BiSolidCloudUpload } from 'react-icons/bi'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { MOTION_EMOJI } from '@/app/lib/motions'
import { LOCAL_STORAGE_KEY } from '@/constants/local-storage'
import Compressor from 'compressorjs'
import { AnimatePresence, motion } from 'framer-motion'

import { cn, numberFormat } from '../lib/helpers'
import type { TMacrosData, TUploadData } from '../lib/types'

export const defaultMacrosData = {
  calories: 0,
  burned: 0,
  protein: 0,
  fat: 0,
  carbohydrates: 0,
} satisfies TMacrosData

type TProps = {
  mealEmoji: string
}

export default function UploadForm({ mealEmoji }: TProps) {
  const router = useRouter()

  const defaultData: TUploadData = useMemo(
    () => ({
      status: 'idle',
      res: {
        ...defaultMacrosData,
        text: '',
      },
    }),
    [],
  )
  const [data, setData] = useState<TUploadData>(defaultData)
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [isNotesVisible, setIsNotesVisible] = useState(false)

  const [isDraggingPlate, setIsDraggingPlate] = useState(false)
  const [isDraggingTable, setIsDraggingTable] = useState(false)

  const plateRef = useRef<HTMLLabelElement | null>(null)
  const tableRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const onSubmit = useCallback(
    async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      if (notes.trim()) {
        formData.append('notes', notes.trim())
      }

      try {
        setData({ ...data, status: 'loading' })

        const response = await fetch('/api/upload-v2', {
          method: 'POST',
          body: formData,
        })

        const { text } = await response.json()
        const parsedText: TUploadData['res'] = JSON.parse(text)

        setData({ ...data, status: 'success', res: parsedText })
      } catch (err) {
        setData({ ...data, status: 'error' })
        throw err
      }
    },
    [data, notes],
  )

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const targetFile = e.target.files?.[0]
      if (!targetFile || !(targetFile instanceof File)) return

      setFile(targetFile)
      setFileUrl(URL.createObjectURL(targetFile))

      new Compressor(targetFile, {
        // Compressor docs: https://www.npmjs.com/package/compressorjs
        quality: 0.6, // 0.6 and above recommend.
        convertSize: Infinity, // Default - 5000000 (5mb) limit, Infinity - no limit.
        success: (compressedFile: File) => {
          onSubmit(compressedFile)
        },
        error: (err) => {
          console.error('Compression error:', err)
        },
      })
    },
    [onSubmit],
  )

  const onTableDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDraggingTable(true)
    if (plateRef.current && plateRef.current.contains(e.target as Node)) {
      setIsDraggingTable(false)
    }
    return
  }

  const onTableDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDraggingTable(false)
    return
  }

  const onTableDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDraggingTable(false)
    return
  }

  const onPlateDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDraggingPlate(true)
    setIsDraggingTable(false)
  }

  const onPlateDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingPlate(false)
      setIsDraggingTable(true)
    }
  }

  const onPlateDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDraggingPlate(false)
    setIsDraggingTable(false)

    const files = e.dataTransfer.files
    if (files.length) {
      onChange({ target: { files } } as React.ChangeEvent<HTMLInputElement>)
    }
  }

  const onPaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of Array.from(items)) {
        if (item.type.includes('image')) {
          const blob = item.getAsFile()
          if (!blob) return

          // Prevent re-uploading the same file.
          if (file && blob.name === file.name && blob.size === file.size) return

          const fileList = new DataTransfer()
          fileList.items.add(blob)

          onChange({
            target: { files: fileList.files },
          } as React.ChangeEvent<HTMLInputElement>)
        }
      }
    },
    [onChange, file],
  )

  const onResetDailyMacrosData = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10)
    const lastReset = localStorage.getItem(LOCAL_STORAGE_KEY.LAST_MACROS_RESET)
    const existing = localStorage.getItem(LOCAL_STORAGE_KEY.MACROS_DATA)

    if (!existing || existing === '{}' || existing === 'null') {
      localStorage.removeItem(LOCAL_STORAGE_KEY.LAST_MACROS_RESET)
    }

    if (lastReset !== today) {
      localStorage.setItem(
        LOCAL_STORAGE_KEY.MACROS_DATA,
        JSON.stringify(defaultMacrosData),
      )
      localStorage.setItem(LOCAL_STORAGE_KEY.LAST_MACROS_RESET, today)
      localStorage.removeItem(LOCAL_STORAGE_KEY.MACROS_HISTORY)
      router.refresh()
    }
  }, [router])

  const onUpdateMacrosData = useCallback(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY.MACROS_DATA)
    const existingData: TMacrosData = storedData
      ? JSON.parse(storedData)
      : defaultMacrosData

    // Calculate the new food's macros
    const newFoodMacros = {
      calories: data.res.calories || 0,
      protein: data.res.protein || 0,
      fat: data.res.fat || 0,
      carbohydrates: data.res.carbohydrates || 0,
    }

    const updatedData = Object.keys(defaultMacrosData).reduce(
      (acc, key) => {
        const storedValue = parseFloat(
          String(existingData[key as keyof TMacrosData]),
        )
        const newValue = parseFloat(
          String(data.res[key as keyof typeof data.res]),
        )

        const validStored = isNaN(storedValue) ? 0 : storedValue
        const validNew = isNaN(newValue) ? 0 : newValue

        acc[key as keyof TMacrosData] = validStored + validNew
        return acc
      },
      {} as typeof defaultMacrosData,
    )

    // Add to history for undo functionality
    const history = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY.MACROS_HISTORY) || '[]',
    )
    history.push(newFoodMacros)
    localStorage.setItem(
      LOCAL_STORAGE_KEY.MACROS_HISTORY,
      JSON.stringify(history),
    )

    localStorage.setItem(
      LOCAL_STORAGE_KEY.MACROS_DATA,
      JSON.stringify({
        ...existingData,
        ...updatedData,
      }),
    )
    window.dispatchEvent(new Event('macrosUpdated'))
    router.refresh()
  }, [data, router])

  useEffect(() => {
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  }, [onPaste])

  useEffect(() => {
    onResetDailyMacrosData()
  }, [onResetDailyMacrosData])

  useEffect(() => {
    if (data.status === 'success') {
      onUpdateMacrosData()
    }
  }, [data.status, onUpdateMacrosData])

  return (
    <main>
      <div
        ref={tableRef}
        onDragOver={onTableDragOver}
        onDragLeave={onTableDragLeave}
        onDrop={onTableDrop}
        className='rounded-full border-0 bg-gray-50 p-10 text-sm shadow-none outline outline-2 outline-offset-4 outline-gray-300 drop-shadow-[0_0_6px_rgba(0,0,0,0.18)] md:text-base dark:bg-neutral-800 dark:outline-neutral-600 dark:drop-shadow-[0_0_6px_rgba(0,0,0,0.4)]'
      >
        <div className='flex flex-col items-center justify-center'>
          <label
            htmlFor='dropzone-file'
            className='cursor-pointer rounded-full'
            ref={plateRef}
            onDragOver={onPlateDragOver}
            onDragLeave={onPlateDragLeave}
            onDrop={onPlateDrop}
          >
            <AnimatePresence>
              <motion.div
                className='relative z-10 h-20 w-20 select-none overflow-hidden rounded-full border-2 border-dashed border-gray-300 outline outline-2 outline-gray-200 [filter:drop-shadow(0px_0px_1px_rgba(0,0,0,1))]'
                {...MOTION_EMOJI()}
                animate={{
                  ...MOTION_EMOJI().animate,
                  scale: isDraggingPlate ? 1.05 : 1,
                }}
                whileHover={{ ...MOTION_EMOJI().animate, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                drag={data.status !== 'loading'}
                dragConstraints={plateRef}
                dragTransition={{ bounceDamping: 14 }}
                dragElastic={0.1}
              >
                <div
                  className={cn(
                    'absolute inset-0 rounded-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-100 dark:to-gray-200',
                  )}
                ></div>
                <div
                  className={cn(
                    'absolute inset-2 rounded-full bg-gray-50 shadow-inner dark:bg-gray-100',
                  )}
                ></div>
                {!fileUrl ? (
                  <p className='pointer-events-nones absolute inset-x-[23px] top-5 w-12'>
                    <AnimatePresence>
                      <motion.span
                        className={cn('block select-none text-3xl')}
                        animate={{
                          x: isDraggingTable ? [0, -5, 5, -5, 5, 0] : 0,
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: isDraggingTable ? Infinity : undefined,
                          repeatType: 'loop',
                        }}
                        exit={{
                          x: 0,
                        }}
                      >
                        {mealEmoji}
                      </motion.span>
                    </AnimatePresence>
                  </p>
                ) : (
                  <Image
                    width={56}
                    height={56}
                    src={fileUrl}
                    alt='Meal'
                    className='absolute inset-0 h-full w-full select-none rounded-full object-cover object-center'
                  />
                )}
              </motion.div>
            </AnimatePresence>
            <input
              id='dropzone-file'
              type='file'
              className='hidden'
              accept='image/*, .heic'
              onChange={onChange}
            />
          </label>

          {data.status === 'idle' && (
            <>
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className='[filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.1))]'
              >
                <BiSolidCloudUpload className='mt-4 fill-gray-600 text-3xl dark:fill-gray-300' />
              </motion.div>

              <p className='text-balance text-center text-gray-600 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)] dark:text-gray-300 dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]'>
                <AnimatePresence mode='wait'>
                  <motion.span
                    key={isDraggingPlate ? 'dragging' : 'default'}
                    className='block font-semibold'
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                  >
                    {isDraggingPlate
                      ? 'Release to Drop It'
                      : 'Select, Drag & Drop, or Paste Meal'}
                  </motion.span>

                  <motion.span className='mt-1 block text-xs font-normal'>
                    PNG, JPG, HEIC, GIF up to 10MB
                  </motion.span>
                </AnimatePresence>
              </p>
            </>
          )}

          {data.status === 'loading' && (
            <>
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className='[filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.1))]'
              >
                <BiLoaderCircle className='mt-4 animate-spin-ease fill-gray-600 text-3xl dark:fill-gray-300' />
              </motion.div>

              <p className='text-balance text-center text-gray-600 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)] dark:text-gray-300 dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]'>
                <motion.span
                  className='block font-semibold'
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  Processing
                </motion.span>
              </p>
            </>
          )}

          {data.status !== 'success' && data.status !== 'loading' && (
            <div className='mt-4 flex w-full flex-col items-center justify-center'>
              <button
                type='button'
                onClick={() => {
                  setIsNotesVisible((value) => !value)
                  if (!isNotesVisible) {
                    setTimeout(() => textareaRef.current?.focus(), 0)
                  }
                }}
                className='inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 outline-none drop-shadow-[0_0_3px_rgba(0,0,0,0.08)] transition-all duration-200 ease-out hover:bg-gray-100 active:scale-[0.97] dark:bg-neutral-800 dark:text-gray-300 dark:drop-shadow-[0_0_3px_rgba(0,0,0,0.2)] dark:hover:bg-neutral-700'
              >
                <span>{isNotesVisible ? 'Hide' : 'Add'} food notes</span>
                <span
                  className='text-base leading-none transition-transform duration-200 ease-out'
                  style={{
                    transform: isNotesVisible
                      ? 'rotate(45deg)'
                      : 'rotate(0deg)',
                  }}
                >
                  +
                </span>
              </button>

              <div
                className='mt-2 grid w-full max-w-xs transition-[grid-template-rows] duration-200 ease-out'
                style={{ gridTemplateRows: isNotesVisible ? '1fr' : '0fr' }}
              >
                <div className='overflow-hidden'>
                  <div
                    className='p-1 transition-all duration-200 ease-out'
                    style={{
                      opacity: isNotesVisible ? 1 : 0,
                      transform: isNotesVisible
                        ? 'translateY(0)'
                        : 'translateY(-6px)',
                    }}
                  >
                    <div className='relative'>
                      <textarea
                        ref={textareaRef}
                        id='food-notes'
                        spellCheck={false}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        maxLength={120}
                        placeholder='extra cheese, half portion...'
                        className='w-full resize-none rounded-full bg-gray-50 px-4 text-center text-sm text-gray-700 outline-none drop-shadow-[0_0_3px_rgba(0,0,0,0.08)] transition-all duration-200 placeholder:text-center placeholder:text-gray-400 md:px-8 dark:bg-neutral-800 dark:text-gray-100 dark:drop-shadow-[0_0_3px_rgba(0,0,0,0.2)] dark:placeholder:text-neutral-500'
                      />
                      {notes.trim() && (
                        <button
                          type='button'
                          onClick={() => setNotes('')}
                          className='absolute right-2 top-1/2 -translate-y-2.5 rounded-full bg-gray-200 p-0.5 text-gray-600 outline-none transition-all hover:bg-gray-300 active:scale-90 md:-translate-y-3 dark:bg-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-600'
                          title='Clear notes'
                        >
                          <svg
                            className='h-2.5 w-2.5 md:h-3 md:w-3'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M6 18L18 6M6 6l12 12'
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {data.status === 'error' && (
            <>
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className='[filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.1))]'
              >
                <BiSolidCloudUpload className='mt-4 fill-gray-600 text-3xl dark:fill-gray-300' />
              </motion.div>

              <p className='text-balance text-center text-gray-600 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)] dark:text-gray-300 dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]'>
                <motion.span
                  className='block font-semibold text-red-500 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)] dark:text-red-400 dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]'
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  Something went wrong, try again
                </motion.span>
              </p>
            </>
          )}
        </div>

        {data.status === 'success' && (
          <AnimatePresence>
            <motion.div
              className='mt-4 flex flex-col items-center justify-center gap-4 overflow-auto text-balance text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]'
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <div>
                <span className='text-gray-500 dark:text-gray-400'>
                  Calories{' '}
                </span>
                <span className='font-semibold'>
                  {numberFormat.format(data.res.calories)} kcal
                </span>
              </div>

              <div className='flex gap-4'>
                <div>
                  <span className='text-gray-500 dark:text-gray-400'>
                    Carbs{' '}
                  </span>
                  <span className='font-semibold'>
                    {numberFormat.format(data.res.carbohydrates)} g
                  </span>
                </div>

                <div>
                  <span className='text-gray-500 dark:text-gray-400'>
                    Protein{' '}
                  </span>
                  <span className='font-semibold'>
                    {numberFormat.format(data.res.protein)} g
                  </span>
                </div>

                <div>
                  <span className='text-gray-500 dark:text-gray-400'>Fat </span>
                  <span className='font-semibold'>
                    {numberFormat.format(data.res.fat)} g
                  </span>
                </div>
              </div>

              <div className='w-11/12'>
                <span className='text-gray-500 dark:text-gray-400'>Meal </span>
                <span className='font-semibold'>{data.res.text}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </main>
  )
}
