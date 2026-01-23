import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Affirmations App',
  description: 'Daily affirmations with beautiful images',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

