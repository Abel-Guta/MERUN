import { distanceLabel, formatDistance, formatDuration } from '../lib/format'
import './TrackerStats.css'

// The time has no spoken label on purpose: it changes every second and a long
// label would make screen readers noisy.
export function TrackerStats({
  durationSec,
  distanceKm,
}: {
  durationSec: number
  distanceKm: number
}) {
  return (
    <dl className="tracker-stats">
      <div>
        <dt>Time</dt>
        <dd>{formatDuration(durationSec)}</dd>
      </div>
      <div>
        <dt>Distance</dt>
        <dd aria-label={distanceLabel(distanceKm)}>{formatDistance(distanceKm)}</dd>
      </div>
    </dl>
  )
}
