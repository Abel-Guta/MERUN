import type { Run } from '../types/run'
import { FeedCard } from './FeedCard'
import './Feed.css'

export function Feed({ runs }: { runs: Run[] }) {
  if (runs.length === 0) return <p className="feed__empty">No runs yet.</p>

  return (
    <section className="feed">
      {runs.map((run) => (
        <FeedCard key={run.id} run={run} />
      ))}
    </section>
  )
}
