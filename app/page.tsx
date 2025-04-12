import MEAL_EMOJI from '@/public/emoji/meal-emoji.json'

import Footer from './components/footer'
import Header from './components/header'
import UploadForm from './components/upload-form'
import { getRandomValue } from './lib/helpers'

export const dynamic = 'force-dynamic'

export default function Home() {
  // Prefetch random emoji to use in client without rehydration issue.
  const mealEmoji = getRandomValue(MEAL_EMOJI) || '🥩'

  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-6'>
      <div className='max-w-xl'>
        <Header />
        <UploadForm mealEmoji={mealEmoji} />
      </div>
      <div className='mt-6 md:mt-8'>
        <Footer />
      </div>
    </div>
  )
}
