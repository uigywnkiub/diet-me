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
