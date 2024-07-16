import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  applicationName: 'Diet ME',
  title: 'Diet Made Easy: Track Calories with Just a Photo!',
  description:
    'Snap a picture of your food, instantly get calorie info. No counting, no stress.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/favicon.ico',
  },
  keywords: 'diet, calorie, food, track, photo',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Diet Made Easy',
    startupImage: {
      url: '/icons/apple-touch-icon.png',
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
      <body className={inter.className}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
