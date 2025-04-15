'use client'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer>
      <div className='text-balance text-center text-xs font-medium text-gray-400 dark:text-gray-500'>
        © {year} Diet ME — Eat Smart. Live Well.
      </div>
    </footer>
  )
}
