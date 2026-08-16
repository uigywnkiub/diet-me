'use client'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className='mb-4 mt-6 flex justify-center md:mt-8'>
      <div className='text-balance text-center text-xs font-medium text-neutral-400 dark:text-neutral-500'>
        © {year} Diet ME — Eat Smart. Live Well.
      </div>
    </footer>
  )
}
