import { useId } from 'react'
import type { Run } from '../types/run'
import { FeedCard } from './FeedCard'
import './Feed.css'

export function Feed({ runs }: { runs: Run[] }) {
  const headingId = useId()

  return (
    <section className="feed" aria-labelledby={headingId}>
      <h2 id={headingId} className="feed__heading">
        Recent runs
      </h2>

      {runs.length === 0 ? (
        <output className="feed__empty">No runs yet.</output>
      ) : (
        <ul className="feed__list">
          {runs.map((run) => (
            <li key={run.id}>
              <FeedCard run={run} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
