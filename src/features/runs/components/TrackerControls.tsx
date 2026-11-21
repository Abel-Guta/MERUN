import { useEffect, useRef, useState } from 'react'
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
  const [confirming, setConfirming] = useState(false)
  const stopRef = useRef<HTMLButtonElement>(null)
  const keepRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef(false)

  // "Keep going" gets focus so a reflex Enter cancels instead of ending the run.
  // Cancelling hands focus back to Stop, which was just replaced.
  useEffect(() => {
    if (confirming) {
      keepRef.current?.focus()
      const onKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          returnFocus.current = true
          setConfirming(false)
        }
      }
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }
    if (returnFocus.current) {
      stopRef.current?.focus()
      returnFocus.current = false
    }
  }, [confirming])

  if (status === 'finished') return null

  if (confirming) {
    return (
      <fieldset className="tracker-controls tracker-controls--confirm">
        <legend className="tracker-controls__question">End this run?</legend>
        <button
          type="button"
          className="tracker-controls__primary"
          ref={keepRef}
          onClick={() => {
            returnFocus.current = true
            setConfirming(false)
          }}
        >
          Keep going
        </button>
        <button
          type="button"
          className="tracker-controls__stop"
          onClick={() => {
            setConfirming(false)
            onStop()
          }}
        >
          End run
        </button>
      </fieldset>
    )
  }

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
        <button
          type="button"
          className="tracker-controls__stop"
          ref={stopRef}
          onClick={() => setConfirming(true)}
        >
          Stop
        </button>
      )}
    </div>
  )
}
