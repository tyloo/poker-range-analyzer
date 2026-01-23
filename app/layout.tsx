import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Poker Range Analyzer',
  description: 'GTO preflop ranges with equity and EV analysis for 6-max NLH',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh w-full bg-gray-900">{children}</body>
    </html>
  )
}
