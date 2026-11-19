import Link from 'next/link'
import type { ReactNode } from 'react'

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="site-bar">
        <Link className="site-bar__mark" href="/">
          MERUN
        </Link>
        <nav aria-label="Main">
          <Link className="site-bar__link" href="/feed">
            Feed
          </Link>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer">
        <p>MERUN is an early MVP. Logging runs from the app is planned.</p>
      </footer>
    </>
  )
}
