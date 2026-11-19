import { useId } from 'react'
import './Accessible.css'

const SPOKEN = [
  { label: 'Pace', seen: '5:24 /km', said: '5 minutes 24 seconds per kilometer' },
  { label: 'Time', seen: '28:05', said: '28 minutes 5 seconds' },
  { label: 'Distance', seen: '5.2 km', said: '5.2 kilometers' },
]

const HABITS = [
  'A skip link at the top of every page.',
  'Keyboard focus you can always see.',
  'A dash, never a broken number, when a run has missing data.',
  'Motion that stops when your device asks it to.',
]

export function Accessible() {
  const headingId = useId()

  return (
    <section className="container accessible" aria-labelledby={headingId}>
      <h2 id={headingId} className="accessible__title">
        Built to be read aloud.
      </h2>
      <p className="accessible__lead">
        Every number on a run has a spoken version, so a screen reader says what a runner would
        say.
      </p>

      <dl className="accessible__pairs">
        {SPOKEN.map((pair) => (
          <div key={pair.label} className="accessible__pair">
            <dt>{pair.label}</dt>
            <dd className="accessible__seen">
              <span className="accessible__tag">On screen</span>
              {pair.seen}
            </dd>
            <dd className="accessible__said">
              <span className="accessible__tag">Spoken</span>
              {pair.said}
            </dd>
          </div>
        ))}
      </dl>

      <ul className="accessible__habits">
        {HABITS.map((habit) => (
          <li key={habit}>{habit}</li>
        ))}
      </ul>
    </section>
  )
}
