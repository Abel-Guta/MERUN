import {
  distanceLabel,
  formatDistance,
  formatDuration,
  kmTicks,
  MAX_KM_TICKS,
} from '../lib/format'
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
      <div className="tracker-stats__time">
        <dt>Time</dt>
        <dd>{formatDuration(durationSec)}</dd>
      </div>
      <div className="tracker-stats__distance">
        <dt>Distance</dt>
        <dd aria-label={distanceLabel(distanceKm)}>
          {formatDistance(distanceKm)}
          {/* Decorative: the distance is already stated as text above */}
          <span className="tracker-stats__ticks" aria-hidden="true">
            {Array.from({ length: MAX_KM_TICKS }, (_, i) => (
              <span
                key={i}
                className={
                  i < kmTicks(distanceKm)
                    ? 'tracker-stats__tick tracker-stats__tick--on'
                    : 'tracker-stats__tick'
                }
              />
            ))}
          </span>
        </dd>
      </div>
    </dl>
  )
}
