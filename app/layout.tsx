import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  applicationName: 'Diet ME',
  title: 'Diet Made Easy',
  description:
    'Take a photo. Get calories, protein, fat, and carbs. Simple as that.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/favicon.ico',
  },
  keywords: [
    'calorie tracker',
    'macro tracker',
    'nutrition',
    'diet',
    'food recognition',
    'photo calorie counter',
    'protein tracker',
    'fat tracker',
    'carb tracker',
    'AI nutrition',
    'health',
    'fitness',
    'meal tracking',
    'photo to macros',
    'nutrition app',
  ],
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
        <SpeedInsights debug={false} />
        <Analytics debug={false} />
      </body>
    </html>
  )
}
