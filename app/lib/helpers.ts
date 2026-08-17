import { LOCAL_STORAGE_KEY } from '@/constants/local-storage'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...args: ClassValue[]) => {
  return twMerge(clsx(args))
}

export const numberFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
})

export const getRandomValue = <T>(
  input: T[] | Iterable<T> | string | number | boolean,
): T | null => {
  // Check for falsy input
  if (!input) return null

  // Handle boolean case
  if (typeof input === 'boolean') {
    return (Math.random() < 0.5 ? true : false) as T // Cast to T
  }

  // Handle number case
  if (typeof input === 'number') {
    return Math.floor(Math.random() * input) as T // Cast to T
  }

  // Handle string case
  if (typeof input === 'string') {
    return input[Math.floor(Math.random() * input.length)] as T // Cast to T
  }

  // Handle iterable cases
  const array = Array.from(input) // Convert iterable to array
  if (array.length === 0) return null // Handle empty iterable

  return array[Math.floor(Math.random() * array.length)]
}

const getLocalDate = (date = new Date()): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const getStreakData = (): {
  count: number
  analyzedToday: boolean
} => {
  if (typeof window === 'undefined') {
    return { count: 0, analyzedToday: false }
  }

  const today = getLocalDate()

  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = getLocalDate(yesterdayDate)

  const lastAnalyzedDate = localStorage.getItem(
    LOCAL_STORAGE_KEY.LAST_FOOD_ANALYZED_DATE,
  )

  let streakCount = parseInt(
    localStorage.getItem(LOCAL_STORAGE_KEY.STREAK_COUNT) || '0',
    10,
  )

  const analyzedToday = lastAnalyzedDate === today

  // No analysis today and no analysis yesterday:
  // the previous streak is broken.
  if (!analyzedToday && lastAnalyzedDate !== yesterday) {
    streakCount = 0
  }

  return {
    count: streakCount,
    analyzedToday,
  }
}

export const updateStreak = (): number => {
  if (typeof window === 'undefined') {
    return 0
  }

  const today = getLocalDate()

  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = getLocalDate(yesterdayDate)

  const lastAnalyzedDate = localStorage.getItem(
    LOCAL_STORAGE_KEY.LAST_FOOD_ANALYZED_DATE,
  )
  const currentStreak = parseInt(
    localStorage.getItem(LOCAL_STORAGE_KEY.STREAK_COUNT) || '0',
    10,
  )

  let newStreak = currentStreak

  if (lastAnalyzedDate === today) {
    // Already analyzed today, multiple analyses on same day don't increment
    newStreak = currentStreak
  } else if (lastAnalyzedDate === yesterday) {
    // Analyzed yesterday - this is a consecutive day, increment streak
    newStreak = currentStreak + 1
  } else {
    // Previous day was not analyzed or first time analyzing
    // Start new streak at 1
    newStreak = 1
  }

  localStorage.setItem(LOCAL_STORAGE_KEY.STREAK_COUNT, String(newStreak))
  localStorage.setItem(LOCAL_STORAGE_KEY.LAST_FOOD_ANALYZED_DATE, today)

  return newStreak
}
