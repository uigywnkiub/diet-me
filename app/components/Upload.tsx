'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import Image from 'next/image'

import classNames from 'classnames'
import Compressor from 'compressorjs'
import { AnimatePresence, motion, useAnimation } from 'framer-motion'

type TData = {
  status: 'error' | 'idle' | 'loading'
  text: string
}

const UploadForm = () => {
  const controls = useAnimation()
  const [data, setData] = useState<TData>({ status: 'idle', text: '' })
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const constraintsRef = useRef(null)

  useEffect(() => {
    if (data.status === 'loading') {
      controls.start({ x: 0, y: 0 })
    }
  }, [data.status, controls])

  const onSubmit = useCallback(
    async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)

      try {
        setData({ ...data, status: 'loading', text: '' })

        const response = await fetch('/api/upload-v2', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to upload file.')
        }

        const { text } = await response.json()
        setData({ ...data, status: 'idle', text })
      } catch (e: any) {
        console.error('Upload failed:', e)
        setData({ ...data, status: 'error', text: e.message })
      }
    },
    [data],
  )

  const onRegenerate = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault()
      if (file) {
        onSubmit(file)
      }
    },
    [file, onSubmit],
  )

  const onReset = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault()
      setData({ status: 'idle', text: '' })
      setFile(null)
      setFileUrl(null)
    },
    [],
  )

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const targetFile = e.target.files?.[0]
      if (!targetFile || !(targetFile instanceof File)) return

      setFile(targetFile)
      setFileUrl(URL.createObjectURL(targetFile))

      new Compressor(targetFile, {
        quality: 0.7,
        convertSize: 4194304 / 10,
        maxWidth: 200,
        maxHeight: 200,
        success: (compressedFile: File) => {
          onSubmit(compressedFile)
        },
        error: (e) => console.error(e),
      })
    },
    [onSubmit],
  )

  const modifiedTextOutput = (text: string) => {
    // Replace **bold** with <b> tags
    const boldedText = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    // Replace newlines with <br /> to preserve line breaks
    const formattedText = boldedText.replace(/\n/g, '<br />')
    return { __html: formattedText } // Return safely formatted HTML
  }

  return (
    <div>
      <h1 className='mb-8 text-center text-3xl font-extrabold text-gray-900 md:text-4xl lg:text-5xl dark:text-white'>
        <span className='bg-gradient-to-r from-red-400 to-blue-600 bg-clip-text text-transparent'>
          Diet Made Easy
          <br />
        </span>
        <span className='bg-gradient-to-r from-gray-500 to-gray-700 bg-clip-text text-xl text-transparent md:text-2xl dark:from-emerald-100 dark:to-sky-100'>
          Track Calories with Just a Photo!
        </span>
      </h1>
      {/* <p className='mb-6 text-center text-lg font-normal text-gray-500 sm:px-16 lg:text-xl xl:px-48 dark:text-gray-400'>
        Snap a picture of your food, instantly get calorie info. No counting, no
        stress.
      </p> */}
      <motion.div className='m-auto flex w-full items-center justify-center lg:w-2/3 2xl:w-1/2'>
        <label
          htmlFor='dropzone-file'
          className={classNames(
            'flex h-fit w-full cursor-pointer flex-col items-center justify-center overflow-clip px-14 pb-0',
            data.status === 'idle' && 'pb-0',
            data.status === 'error' && 'pb-4',
            data.text && 'pb-8',
            data.status !== 'loading' &&
              'rounded-full border-2 border-dashed border-gray-300 dark:bg-gray-800 light:bg-gray-50 outline outline-2 outline-offset-4 outline-gray-300',
          )}
          ref={constraintsRef}
        >
          <motion.div className='flex flex-col items-center justify-center py-5'>
            {!data.text && data.status === 'idle' && (
              <>
                <svg
                  className='mb-2 h-8 w-8 text-gray-500 dark:text-gray-400'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 20 16'
                >
                  <path
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2'
                  />
                </svg>
                <p className='text-md mb-4 select-none text-gray-500 dark:text-gray-400'>
                  <span className='font-semibold'>Upload Your Meal</span>
                </p>
              </>
            )}
            <motion.div
              className='relative z-10 h-20 w-20 select-none overflow-hidden rounded-full border-4 border-gray-300 bg-white dark:border-gray-300 dark:bg-gray-800 dark:text-gray-300'
              whileHover={{ scale: 1.1, rotate: 45 }}
              whileTap={{
                scale: 0.9,
                rotate: -45,
                type: 'spring',
                cursor: 'grabbing',
              }}
              animate={controls}
              drag={data.status !== 'loading'}
              dragConstraints={constraintsRef}
              dragTransition={{ bounceStiffness: 600, bounceDamping: 10 }}
            >
              <div className='absolute inset-0 rounded-full bg-gray-100'></div>
              <div className='absolute inset-2 rounded-full bg-white'></div>
              {!fileUrl && (
                <h1
                  className={`absolute ${
                    data.status === 'idle' ? 'animate-wiggle' : ''
                  } inset-x-5 top-3 w-12`}
                >
                  <span className='text-4xl'>🥩</span>
                </h1>
              )}
              {fileUrl && (
                <Image
                  width={56}
                  height={56}
                  className={`absolute right-3 top-3 aspect-square w-4/6 select-none rounded-full ${
                    !data.text && data.status === 'loading'
                      ? 'animate-spin'
                      : ''
                  }`}
                  src={fileUrl}
                  alt='Food'
                />
              )}
            </motion.div>
          </motion.div>
          {data.text && (
            <AnimatePresence>
              <motion.div className='overflow-auto'>
                {data.status === 'error' ? (
                  <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, type: 'spring' }}
                    exit={{ y: 20, opacity: 0 }}
                    className='ping text-md text-center font-medium text-red-400'
                    dangerouslySetInnerHTML={modifiedTextOutput(data.text)}
                  ></motion.h1>
                ) : (
                  <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, type: 'spring' }}
                    exit={{ y: 20, opacity: 0 }}
                    className='text-md text-center font-medium text-black dark:text-white'
                    dangerouslySetInnerHTML={modifiedTextOutput(data.text)}
                  ></motion.h1>
                )}
              </motion.div>
            </AnimatePresence>
          )}
          {/* {!data.text && data.status === "loading" && (
            <motion.h1
              className="text-center animate-pulse text-black dark:text-white font-medium text-md"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1, type: "spring" }}
              exit={{ y: 20, opacity: 0 }}
            >
              Processing...
            </motion.h1>
          )} */}
          <input
            id='dropzone-file'
            type='file'
            className='hidden'
            accept='image/*, .heic'
            onChange={onChange}
          />
        </label>
      </motion.div>
      {(data.status === 'loading' || data.status === 'error' || data.text) && (
        <div className='flex justify-center'>
          <motion.button
            disabled={data.status === 'loading'}
            type='button'
            className='mt-6 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
            onClick={onRegenerate}
          >
            {data.status === 'loading' && (
              <svg
                aria-hidden='true'
                role='status'
                className='me-3 inline h-4 w-4 animate-spin text-gray-200 dark:text-gray-600'
                viewBox='0 0 100 101'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                  fill='currentColor'
                />
                <path
                  d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                  fill='#1C64F2'
                />
              </svg>
            )}
            {data.status === 'loading' ? 'Analyzing...' : 'Reanalyze'}
          </motion.button>
        </div>
      )}
      {data.status === 'error' && (
        <div className='flex justify-center'>
          <motion.button
            type='button'
            className='mt-3 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-red-800 hover:bg-gray-100 hover:text-red-700 focus:z-10 dark:border-gray-600 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700 dark:hover:text-red-400'
            onClick={onReset}
          >
            Reset
          </motion.button>
        </div>
      )}
    </div>
  )
}

export default UploadForm
