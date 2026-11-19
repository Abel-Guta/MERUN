import type { Metadata } from 'next'
import { Saira } from 'next/font/google'
import type { ReactNode } from 'react'
import './globals.css'

const saira = Saira({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-saira',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'merun',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={saira.variable}>
      <body>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  )
}
