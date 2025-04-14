'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BiLoaderCircle, BiSolidCloudUpload } from 'react-icons/bi'

import Image from 'next/image'

import { MOTION_EMOJI } from '@/app/lib/motions'
import Compressor from 'compressorjs'
import { AnimatePresence, motion } from 'framer-motion'

import { cn } from '../lib/helpers'
import type { TUploadData } from '../lib/types'

type TProps = {
  mealEmoji: string
}

export default function UploadForm({ mealEmoji }: TProps) {
  const defaultData: TUploadData = useMemo(
    () => ({
      status: 'idle',
      res: {
        calories: 0,
        protein: 0,
        fat: 0,
        carbohydrates: 0,
        text: '',
      },
    }),
    [],
  )
  const [data, setData] = useState<TUploadData>(defaultData)
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  const [isDraggingPlate, setIsDraggingPlate] = useState(false)
  const [isDraggingTable, setIsDraggingTable] = useState(false)

  const plateRef = useRef<HTMLLabelElement | null>(null)
  const tableRef = useRef<HTMLDivElement | null>(null)

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

  const onSubmit = useCallback(
    async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)

      try {
        setData({ ...defaultData, status: 'loading' })

        const response = await fetch('/api/upload-v2', {
          method: 'POST',
          body: formData,
        })

        const { text } = await response.json()
        const parsedText: TUploadData['res'] = JSON.parse(text)

        setData({ ...defaultData, status: 'success', res: parsedText })
      } catch (err) {
        setData({ ...defaultData, status: 'error' })
        throw err
      }
    },
    [defaultData],
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

  useEffect(() => {
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  }, [onPaste])

  return (
    <main>
      <div
        ref={tableRef}
        onDragOver={onTableDragOver}
        onDragLeave={onTableDragLeave}
        onDrop={onTableDrop}
        className='rounded-full border-0 border-double border-gray-300 bg-gray-50 p-10 text-sm shadow-lg outline outline-2 outline-offset-4 outline-gray-300 md:text-base dark:bg-gray-800'
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
                className='relative z-10 h-20 w-20 select-none overflow-hidden rounded-full border-2 border-dashed border-gray-300'
                {...MOTION_EMOJI()}
                animate={{
                  ...MOTION_EMOJI().animate,
                  scale: isDraggingPlate ? 1.05 : 1,
                }}
                whileHover={{ ...MOTION_EMOJI().animate, scale: 1.05 }}
                drag={data.status !== 'loading'}
                dragConstraints={plateRef}
                dragTransition={{ bounceDamping: 14 }}
              >
                <div
                  className={cn(
                    'absolute inset-0 rounded-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-200 dark:to-gray-300',
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
              >
                <BiSolidCloudUpload className='mt-4 fill-gray-600 text-3xl dark:fill-gray-300' />
              </motion.div>

              <p className='text-balance text-center text-gray-600 dark:text-gray-300'>
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
                  {/* <motion.span className='block text-sm font-normal'>
                    PNG, JPG, HEIC, GIF up to 10MB
                  </motion.span> */}
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
              >
                <BiLoaderCircle className='animate-spin-ease mt-4 fill-gray-600 text-3xl dark:fill-gray-300' />
              </motion.div>
              <p className='text-balance text-center text-gray-600 dark:text-gray-300'>
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

          {data.status === 'error' && (
            <>
              <BiSolidCloudUpload className='mt-4 fill-gray-600 text-3xl dark:fill-gray-300' />
              <p className='text-balance text-center text-gray-600 dark:text-gray-300'>
                <span className='block font-semibold text-red-400'>
                  Something went wrong on our end.
                </span>
              </p>
            </>
          )}
        </div>

        {data.status === 'success' && (
          <AnimatePresence>
            <motion.div
              className='mt-4 flex flex-col items-center justify-center gap-4 overflow-auto text-balance text-center'
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <div>
                <span className='text-gray-500 dark:text-gray-400'>
                  Calories:{' '}
                </span>
                <span className='font-semibold'>{data.res.calories} kcal</span>
              </div>
              <div className='flex gap-4'>
                <div>
                  <span className='text-gray-500 dark:text-gray-400'>
                    Protein:{' '}
                  </span>
                  <span className='font-semibold'>{data.res.protein} g</span>
                </div>
                <div>
                  <span className='text-gray-500 dark:text-gray-400'>
                    Fat:{' '}
                  </span>
                  <span className='font-semibold'>{data.res.fat} g</span>
                </div>
                <div>
                  <span className='text-gray-500 dark:text-gray-400'>
                    Carbohydrates:{' '}
                  </span>
                  <span className='font-semibold'>
                    {data.res.carbohydrates} g
                  </span>
                </div>
              </div>
              <div className='w-11/12'>
                <span className='text-gray-500 dark:text-gray-400'>Meal: </span>
                <span className='font-semibold'>{data.res.text}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </main>
  )
}
