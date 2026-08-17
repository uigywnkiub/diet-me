'use client'

import { useEffect, useState } from 'react'

import { getStreakData } from '@/app/lib/helpers'
import { motion } from 'framer-motion'

export default function FireStreak() {
  const [streakCount, setStreakCount] = useState(0)
  const [analyzedToday, setAnalyzedToday] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Initial load
    const { count, analyzedToday: today } = getStreakData()
    setStreakCount(count)
    setAnalyzedToday(today)

    // Listen for updates from upload-form
    const handleStreakUpdate = () => {
      const { count, analyzedToday: today } = getStreakData()
      setStreakCount(count)
      setAnalyzedToday(today)
    }

    window.addEventListener('streakUpdated', handleStreakUpdate)

    // Listen for macros updates (fallback)
    window.addEventListener('macrosUpdated', handleStreakUpdate)

    // Polling for streak updates (checks every 500ms)
    const interval = setInterval(() => {
      const { count, analyzedToday: today } = getStreakData()
      setStreakCount((prev) => (prev !== count ? count : prev))
      setAnalyzedToday((prev) => (prev !== today ? today : prev))
    }, 500)

    return () => {
      window.removeEventListener('streakUpdated', handleStreakUpdate)
      window.removeEventListener('macrosUpdated', handleStreakUpdate)
      clearInterval(interval)
    }
  }, [])

  if (!mounted) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className='bg-app-gradient-removed fixed left-4 top-4 z-50 cursor-default select-none rounded-full bg-gray-50 p-3 shadow-[0_0_10px_rgba(0,0,0,0.18)] outline-none transition-all duration-200 md:left-10 md:top-10 dark:bg-neutral-800 dark:shadow-[0_0_10px_rgba(0,0,0,0.4)]'
    >
      <div className='flex items-center gap-0.5'>
        <motion.div
          className={`transition-all duration-200 ${
            analyzedToday ? 'grayscale-0' : 'grayscale'
          }`}
          animate={{ scale: analyzedToday ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            className='h-4 w-4 md:h-5 md:w-5'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M12.2 22C7.8 22 4 18.7 4 14.3C4 10.8 6.1 8.1 9.3 5.4C9.1 8.1 10.4 9.4 11.7 10.2C11.5 7.1 13.2 4.2 15.8 2C15.8 5.8 20 8.1 20 13.8C20 18.5 16.5 22 12.2 22Z'
              fill='currentColor'
              className='text-orange-500 dark:text-orange-400'
            />
            <path
              d='M12.2 19.2C10.1 19.2 8.5 17.7 8.5 15.7C8.5 14.1 9.4 12.8 10.9 11.6C10.8 13 11.5 13.8 12.4 14.2C12.3 12.8 13 11.6 14.2 10.7C14.2 13 16 14.1 16 15.9C16 17.8 14.5 19.2 12.2 19.2Z'
              fill='currentColor'
              className='text-yellow-400 dark:text-yellow-300'
            />
          </svg>
        </motion.div>

        <motion.span
          className={`text-base font-bold transition-all duration-200 md:text-lg ${
            analyzedToday
              ? 'text-orange-500 dark:text-orange-400'
              : 'text-gray-400 dark:text-gray-600'
          }`}
          animate={{ scale: analyzedToday ? 1.05 : 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {streakCount}
        </motion.span>
      </div>
    </motion.div>
  )
}
