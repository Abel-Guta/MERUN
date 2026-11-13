import { useId } from 'react'
import type { Run } from '../types'
import {
  distanceLabel,
  durationLabel,
  formatDate,
  formatDateLong,
  formatDistance,
  formatDuration,
  formatPace,
  paceLabel,
} from '../format'
import './FeedCard.css'

export function FeedCard({ run }: { run: Run }) {
  const titleId = useId()
  const { user } = run

  return (
    <article className="feed-card" aria-labelledby={titleId}>
      <header className="feed-card__header">
        {/* Decorative: the name is rendered as text right next to it */}
        <img className="feed-card__avatar" src={user.avatarUrl} alt="" width={40} height={40} />
        <div>
          <p className="feed-card__name">
            {user.name} <span className="visually-hidden">ran</span>
          </p>
          <p className="feed-card__meta">
            <span aria-label={`Username ${user.username}`}>@{user.username}</span>
            <span aria-hidden="true"> · </span>
            <time dateTime={run.date} aria-label={formatDateLong(run.date)}>
              {formatDate(run.date)}
            </time>
            <span aria-hidden="true"> · </span>
            <span>
              <span className="visually-hidden">Location: </span>
              {run.location}
            </span>
          </p>
        </div>
      </header>

      <h3 className="feed-card__title" id={titleId}>
        {run.title}
      </h3>
      {run.notes && <p className="feed-card__notes">{run.notes}</p>}

      <dl className="feed-card__stats" aria-label="Run statistics">
        <div>
          <dt>Distance</dt>
          <dd aria-label={distanceLabel(run.distanceKm)}>{formatDistance(run.distanceKm)}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd aria-label={durationLabel(run.durationSec)}>{formatDuration(run.durationSec)}</dd>
        </div>
        <div>
          <dt>Pace</dt>
          <dd aria-label={paceLabel(run.distanceKm, run.durationSec)}>
            {formatPace(run.distanceKm, run.durationSec)}
          </dd>
        </div>
      </dl>
    </article>
  )
}
