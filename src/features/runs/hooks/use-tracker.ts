'use client'

import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { totalDistanceKm, type Fix } from '../lib/geo'
import { elapsedSec, initialTracker, trackerReducer } from '../lib/tracker'
import { useGpsWatch } from './use-gps-watch'

export function useTracker() {
  const [state, dispatch] = useReducer(trackerReducer, initialTracker)
  // One list of fixes per running stretch, so travel while paused is never measured.
  const [segments, setSegments] = useState<Fix[][]>([])
  // The reducer never reads the clock, so the screen's seconds tick from this.
  const [now, setNow] = useState(() => Date.now())

  const status = state.status
  const running = status === 'running'

  const addFix = useCallback((fix: Fix) => {
    setSegments((all) =>
      all.length === 0 ? all : [...all.slice(0, -1), [...all[all.length - 1], fix]],
    )
  }, [])
  const { error } = useGpsWatch(running, addFix)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [running])

  const distanceKm = useMemo(
    () => segments.reduce((sum, segment) => sum + totalDistanceKm(segment), 0),
    [segments],
  )

  // start and resume check the status because they also change the segments;
  // the reducer alone would ignore a bad event but the segments would still move.
  const start = useCallback(() => {
    if (status !== 'idle') return
    const at = Date.now()
    setNow(at)
    setSegments([[]])
    dispatch({ type: 'start', at })
  }, [status])

  const resume = useCallback(() => {
    if (status !== 'paused') return
    const at = Date.now()
    setNow(at)
    setSegments((all) => [...all, []])
    dispatch({ type: 'resume', at })
  }, [status])

  const pause = useCallback(() => dispatch({ type: 'pause', at: Date.now() }), [])

  const stop = useCallback(() => {
    const at = Date.now()
    setNow(at)
    dispatch({ type: 'stop', at })
  }, [])

  const reset = useCallback(() => {
    setSegments([])
    dispatch({ type: 'reset' })
  }, [])

  return {
    status,
    startedAt: state.status === 'idle' ? null : state.startedAt,
    distanceKm,
    durationSec: elapsedSec(state, now),
    error,
    start,
    pause,
    resume,
    stop,
    reset,
  }
}
