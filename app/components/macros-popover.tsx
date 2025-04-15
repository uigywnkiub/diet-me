'use client'

import { BiSolidBookBookmark, BiSolidTrashAlt } from 'react-icons/bi'

import { useRouter } from 'next/navigation'

import { LOCAL_STORAGE_KEY } from '@/constants/local-storage'
import { AnimatePresence, motion } from 'framer-motion'

import { numberFormat } from '../lib/helpers'
import type { TMacrosData } from '../lib/types'
import { defaultMacrosData } from './upload-form'

export default function MacrosPopover() {
  const router = useRouter()

  const storedData = localStorage.getItem(LOCAL_STORAGE_KEY.MACROS_DATA)
  const existingData: TMacrosData = storedData
    ? JSON.parse(storedData)
    : defaultMacrosData

  const onClearMacrosData = () => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY.MACROS_DATA,
      JSON.stringify(defaultMacrosData),
    )
    // localStorage.removeItem(LOCAL_STORAGE_KEY.LAST_MACROS_RESET)
    router.refresh()
  }

  return (
    <>
      <div
        id='popover'
        popover='auto'
        className='w-80 rounded-xl bg-gray-50 p-6 text-sm text-gray-800 shadow-lg backdrop:bg-black/30 backdrop:backdrop-blur-sm md:w-1/3 md:text-base dark:bg-gray-800'
      >
        <div className='mb-4 flex items-center justify-around'>
          <h3 className='text-balance text-center font-medium text-black dark:text-white'>
            Today&apos;s Macronutrient Summary
          </h3>
          
          {existingData.calories > 0 && (
            <button onClick={onClearMacrosData}>
              <BiSolidTrashAlt className='fill-red-500 dark:fill-red-400' />
            </button>
          )}
        </div>

        <AnimatePresence>
          <motion.div
            className='mt-4 flex flex-col items-center justify-center gap-4 overflow-auto text-balance text-center text-black dark:text-white'
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
                {numberFormat.format(existingData.calories)} kcal
              </span>
            </div>
            <div className='flex gap-4'>
              <div>
                <span className='text-gray-500 dark:text-gray-400'>
                  Protein{' '}
                </span>
                <span className='font-semibold'>
                  {numberFormat.format(existingData.protein)} g
                </span>
              </div>
              <div>
                <span className='text-gray-500 dark:text-gray-400'>Fat </span>
                <span className='font-semibold'>
                  {numberFormat.format(existingData.fat)} g
                </span>
              </div>
              <div>
                <span className='text-gray-500 dark:text-gray-400'>Carbs </span>
                <span className='font-semibold'>
                  {numberFormat.format(existingData.carbohydrates)} g
                </span>
              </div>
            </div>
            <div className='text-xs text-gray-500 dark:text-gray-400'>
              Every successful analysis updates the data
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        // popoverTarget='popover'
        {...{ popovertarget: 'popover' }}
        className='fixed right-4 top-4 rounded-full bg-gray-50 p-2 shadow-lg dark:bg-gray-800'
      >
        <BiSolidBookBookmark className='fill-gray-600 text-lg dark:fill-gray-300' />
      </button>
    </>
  )
}
