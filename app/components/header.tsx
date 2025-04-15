export default function Header() {
  return (
    <header>
      <h1 className='mb-6 text-center text-2xl font-extrabold text-gray-900 md:mb-8 md:text-3xl dark:text-white'>
        <span className='bg-gradient-to-r from-red-400 to-blue-600 bg-clip-text text-transparent'>
          Diet Made Easy
          <br />
        </span>
        <span className='bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-lg text-transparent md:text-xl dark:from-emerald-50 dark:to-sky-200'>
          Photo → Calories + Macros.
        </span>
      </h1>
    </header>
  )
}
