'use client'

import { useEffect, useState } from 'react'
import type { Fix } from '../lib/geo'
import { toFix } from '../lib/position'

export type GpsError = 'unsupported' | 'denied' | 'unavailable'

// High accuracy uses the GPS chip rather than wifi/cell guesses, at a battery
// cost. maximumAge 0 refuses cached positions.
const OPTIONS: PositionOptions = { enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 }

export function useGpsWatch(active: boolean, onFix: (fix: Fix) => void) {
  const [error, setError] = useState<GpsError | null>(null)
  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator

  useEffect(() => {
    if (!active || !supported) return

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const fix = toFix(position)
        if (!fix) return
        setError(null)
        onFix(fix)
      },
      (failure) => {
        setError(failure.code === failure.PERMISSION_DENIED ? 'denied' : 'unavailable')
      },
      OPTIONS,
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [active, supported, onFix])

  // Only reported once tracking is active, so the server render and the first
  // client render agree.
  return { error: active && !supported ? 'unsupported' : error }
}
