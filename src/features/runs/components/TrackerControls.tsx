import type { TrackerState } from '../lib/tracker'
import './TrackerControls.css'

interface TrackerControlsProps {
  status: TrackerState['status']
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
}

export function TrackerControls({
  status,
  onStart,
  onPause,
  onResume,
  onStop,
}: TrackerControlsProps) {
  if (status === 'finished') return null

  const primary = {
    idle: { label: 'Start', onClick: onStart },
    running: { label: 'Pause', onClick: onPause },
    paused: { label: 'Resume', onClick: onResume },
  }[status]

  // The primary button stays the same element and only changes its label, so
  // keyboard focus is not lost when Pause becomes Resume.
  return (
    <div className="tracker-controls">
      <button type="button" className="tracker-controls__primary" onClick={primary.onClick}>
        {primary.label}
      </button>
      {status !== 'idle' && (
        <button type="button" className="tracker-controls__stop" onClick={onStop}>
          Stop
        </button>
      )}
    </div>
  )
}
