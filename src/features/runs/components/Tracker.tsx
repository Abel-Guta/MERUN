'use client'

import { useId } from 'react'
import { useTracker } from '../hooks/use-tracker'
import { TrackerControls } from './TrackerControls'
import { TrackerStats } from './TrackerStats'
import { TrackerStatus } from './TrackerStatus'
import './Tracker.css'

// The hook's `error` is not shown on purpose: a denied location only means the
// distance stays at zero while the time keeps counting (manual distance comes later).
export function Tracker() {
  const headingId = useId()
  const tracker = useTracker()

  return (
    <section className="tracker" aria-labelledby={headingId}>
      <h2 id={headingId} className="tracker__heading">
        Track a run
      </h2>
      <div className="tracker__panel">
        <TrackerStatus status={tracker.status} />
        <TrackerStats durationSec={tracker.durationSec} distanceKm={tracker.distanceKm} />
        <TrackerControls
          status={tracker.status}
          onStart={tracker.start}
          onPause={tracker.pause}
          onResume={tracker.resume}
          onStop={tracker.stop}
          onReset={tracker.reset}
        />
      </div>
    </section>
  )
}
