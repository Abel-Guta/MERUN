import Link from 'next/link'
import type { ReactNode } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="app__header">
        <h1 className="app__title">
          <Link href="/">MERUN</Link>
        </h1>
      </header>
      <main id="main" className="app" tabIndex={-1}>
        {children}
      </main>
    </>
  )
}
