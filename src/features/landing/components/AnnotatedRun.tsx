import { useId } from 'react'
import './AnnotatedRun.css'

const TICKS = Array.from({ length: 10 }, (_, index) => index)
const LIT_TICKS = 5

// In the order they appear on the card, top to bottom.
const NOTES = [
  {
    title: 'Notes stay with the run.',
    text: 'A line about how it felt, kept next to the numbers.',
  },
  {
    title: 'Distance leads.',
    text: 'The number you came for is the biggest thing on the card, with one tick for every kilometre.',
  },
  {
    title: 'Pace is worked out for you.',
    text: 'Distance and time go in. Minutes per kilometre come out.',
  },
]

export function AnnotatedRun() {
  const headingId = useId()

  return (
    <section className="container run-demo" aria-labelledby={headingId}>
      <h2 id={headingId} className="run-demo__title">
        One run, read at a glance.
      </h2>

      <div className="run-demo__stage">
        <figure className="run-demo__figure">
          <div className="run-demo__card">
            <p className="run-demo__meta">Sample runner · Addis Ababa</p>
            <h3 className="run-demo__run">Morning easy run</h3>
            <p className="run-demo__notes-line">Legs felt fresh.</p>
            <dl className="run-demo__stats">
              <div className="run-demo__lead">
                <dt>Distance</dt>
                <dd>
                  5.2 km
                  <span className="run-demo__ticks" aria-hidden="true">
                    {TICKS.map((tick) => (
                      <span
                        key={tick}
                        className={
                          tick < LIT_TICKS ? 'run-demo__tick run-demo__tick--on' : 'run-demo__tick'
                        }
                      />
                    ))}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>28:05</dd>
              </div>
              <div>
                <dt>Pace</dt>
                <dd>5:24 /km</dd>
              </div>
            </dl>
          </div>
          <figcaption className="run-demo__caption">An example run, not live data.</figcaption>
        </figure>

        <ul className="run-demo__list">
          {NOTES.map((note) => (
            <li key={note.title} className="run-demo__note">
              <strong>{note.title}</strong> {note.text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
