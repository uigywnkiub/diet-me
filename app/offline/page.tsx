import Head from 'next/head'

export default function Offline() {
  return (
    <>
      <Head>
        <title>Diet ME is offline</title>
      </Head>
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <h1 style={{ fontWeight: 500, fontSize: '1.4rem' }}>
          Try to reconnect to your wifi or call a provider.
        </h1>
        <p>With love Diet ME ❤️</p>
      </div>
    </>
  )
}
