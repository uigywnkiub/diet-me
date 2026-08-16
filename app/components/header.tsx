export default function Header() {
  return (
    <header>
      <h1 className='mb-6 text-center text-2xl font-extrabold drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)] md:mb-8 md:text-3xl dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]'>
        <span className='bg-gradient-to-r from-red-400 to-blue-600 bg-clip-text text-transparent'>
          D
          <span className='-ml-1.5 -mr-2 inline-block -translate-y-1.5 rotate-[320deg] text-2xl text-[initial] [-webkit-text-fill-color:initial] md:-ml-2 md:-mr-2.5 md:-translate-y-2 md:text-3xl'>
            🥕
          </span>
          et Made Easy
          <br />
        </span>

        <span className='bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-lg text-transparent md:text-xl dark:from-emerald-50 dark:to-sky-200'>
          Photo → Calories + Macros
        </span>
      </h1>
    </header>
  )
}
