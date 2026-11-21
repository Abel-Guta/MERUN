import type { TrackerState } from '../lib/tracker'
import './TrackerStatus.css'

const TEXT: Record<TrackerState['status'], string> = {
  idle: 'Ready',
  running: 'Running',
  paused: 'Paused',
  finished: 'Run finished',
}

// Visible word and live region in one element. The clock is not announced.
export function TrackerStatus({ status }: { status: TrackerState['status'] }) {
  return (
    <output className={`tracker-status tracker-status--${status}`}>
      {/* Decorative: the word next to it carries the meaning */}
      <span className="tracker-status__mark" aria-hidden="true" />
      {TEXT[status]}
    </output>
  )
}
