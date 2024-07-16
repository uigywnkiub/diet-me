import UploadForm from './components/Upload'

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-6 md:p-24'>
      <div className='md:w-2/3'>
        <UploadForm />
      </div>
    </main>
  )
}
