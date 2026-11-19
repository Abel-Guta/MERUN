import Link from 'next/link'
import { useId } from 'react'
import './Closing.css'

export function Closing() {
  const headingId = useId()

  return (
    <section className="container closing" aria-labelledby={headingId}>
      <h2 id={headingId} className="closing__title">
        Start with the feed.
      </h2>
      <p className="closing__lead">Every run on MERUN, newest first.</p>
      <Link className="closing__cta" href="/feed">
        See the feed
      </Link>
    </section>
  )
}
