import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'merun',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <header className="app__header">
          <h1 className="app__title">MERUN</h1>
        </header>
        <main id="main" className="app" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  )
}
