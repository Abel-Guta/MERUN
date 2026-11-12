import type { Run } from '../types/run'
import { formatDate, formatDuration, formatPace } from '../lib/format'
import './FeedCard.css'

export function FeedCard({ run }: { run: Run }) {
  const { user } = run
  return (
    <article className="feed-card">
      <header className="feed-card__header">
        <img className="feed-card__avatar" src={user.avatarUrl} alt="" width={40} height={40} />
        <div>
          <div className="feed-card__name">{user.name}</div>
          <div className="feed-card__meta">
            @{user.username} · {formatDate(run.date)} · {run.location}
          </div>
        </div>
      </header>

      <h2 className="feed-card__title">{run.title}</h2>
      {run.notes && <p className="feed-card__notes">{run.notes}</p>}

      <dl className="feed-card__stats">
        <div>
          <dt>Distance</dt>
          <dd>{run.distanceKm.toFixed(1)} km</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{formatDuration(run.durationSec)}</dd>
        </div>
        <div>
          <dt>Pace</dt>
          <dd>{formatPace(run.distanceKm, run.durationSec)}</dd>
        </div>
      </dl>
    </article>
  )
}
