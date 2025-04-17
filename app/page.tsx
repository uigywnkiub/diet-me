import MEAL_EMOJI from '@/public/emoji/meal-emoji.json'

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
    <div className='flex min-h-screen flex-col px-6'>
      <div className='flex flex-grow items-center justify-center'>
        <div className='md:max-w-xl w-full'>
          <Header />
          <UploadForm mealEmoji={mealEmoji} />
        </div>
      </div>

      <div className='mb-4 mt-6 flex justify-center md:mt-8'>
        <Footer />
      </div>
      <MacrosPopover />
    </div>
  )
}
