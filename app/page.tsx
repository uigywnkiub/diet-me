import MEAL_EMOJI from '@/public/emoji/meal-emoji.json'

import FireStreak from './components/fire-streak'
import Footer from './components/footer'
import Header from './components/header'
import MacrosPopover from './components/macros-popover'
import UploadForm from './components/upload-form'
import { getRandomValue } from './lib/helpers'

export const dynamic = 'force-dynamic'

export default function Home() {
  // Prefetch random emoji to use in client without rehydration issue.
  // Also to make random works we need to define `force-dynamic`.
  const mealEmoji = getRandomValue(MEAL_EMOJI) || '🥩'

  return (
    <div className='relative flex min-h-screen flex-col px-6'>
      <div className="absolute inset-0 -z-10 bg-[url('/images/bg/food-bg.jpg')] bg-cover bg-center opacity-20" />
      <div className='bg-gray/50 dark:bg-black/50-removed absolute inset-0 -z-10' />

      <div className='flex flex-grow items-center justify-center'>
        <div className='w-full md:max-w-xl'>
          <Header />
          <UploadForm mealEmoji={mealEmoji} />
        </div>
      </div>

      <MacrosPopover />
      <FireStreak />
      <Footer />
    </div>
  )
}
