import Link from 'next/link'

import MEAL_EMOJI from '@/public/emoji/meal-emoji.json'

import UploadForm from './components/upload-form'
import { getRandomValue } from './lib/helpers'

export default function Home() {
  // Prefetch random emoji to use in client without rehydration issue.
  const mealEmoji = getRandomValue(MEAL_EMOJI) || '🥩'

  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-6'>
      <UploadForm mealEmoji={mealEmoji} />
      <footer>
        <div className='fixed bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 md:text-sm'>
          Diet ME · Built by{' '}
          <Link
            href='https://volodymyr-g.vercel.app'
            target='_blank'
            className='cursor-pointer underline-offset-4 hover:text-gray-700 hover:underline dark:hover:text-gray-300'
          >
            Volodymyr
          </Link>
        </div>
      </footer>
    </div>
  )
}
