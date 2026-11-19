import Link from 'next/link'
import { useId } from 'react'
import { HeroArt } from './HeroArt'
import './Hero.css'

export function Hero() {
  const headingId = useId()

  return (
    <section className="hero" aria-labelledby={headingId}>
      <div className="hero__copy">
        <h1 id={headingId} className="hero__title">
          Every run, on the record.
        </h1>
        <p className="hero__lead">
          MERUN is a run log. Every run shows how far, how long and how fast, and where it
          happened.
        </p>
        <Link className="hero__cta" href="/feed">
          See the feed
        </Link>
      </div>
      <HeroArt />
    </section>
  )
}
