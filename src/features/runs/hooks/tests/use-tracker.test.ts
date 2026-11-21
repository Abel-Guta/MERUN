// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { distanceKm } from '../../lib/geo'
import { useTracker } from '../use-tracker'
import { installFakeGeolocation, removeFakeGeolocation } from './fake-geolocation'

const START = 1_000_000

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(START)
})

afterEach(() => {
  cleanup()
  removeFakeGeolocation()
  vi.useRealTimers()
})

const tick = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms)
  })

describe('useTracker', () => {
  it('starts idle with zeros', () => {
    installFakeGeolocation()
    const { result } = renderHook(() => useTracker())
    expect(result.current).toMatchObject({
      status: 'idle',
      startedAt: null,
      distanceKm: 0,
      durationSec: 0,
      error: null,
    })
  })

  it('starts, records the start time and counts seconds', () => {
    const gps = installFakeGeolocation()
    const { result } = renderHook(() => useTracker())
    act(() => result.current.start())
    expect(result.current.status).toBe('running')
    expect(result.current.startedAt).toBe(START)
    expect(gps.watchPosition).toHaveBeenCalledTimes(1)
    tick(5000)
    expect(result.current.durationSec).toBe(5)
  })

  it('adds distance from fixes', () => {
    const gps = installFakeGeolocation()
    const { result } = renderHook(() => useTracker())
    act(() => result.current.start())
    act(() => gps.emit(9.03, 38.74))
    act(() => gps.emit(9.031, 38.74))
    expect(result.current.distanceKm).toBeCloseTo(
      distanceKm({ lat: 9.03, lng: 38.74 }, { lat: 9.031, lng: 38.74 }),
      9,
    )
  })

  it('does not count a stationary wobble', () => {
    const gps = installFakeGeolocation()
    const { result } = renderHook(() => useTracker())
    act(() => result.current.start())
    for (let i = 0; i < 20; i++) {
      act(() => gps.emit(9.03 + (i % 2 === 0 ? 0.000018 : -0.000018), 38.74))
    }
    expect(result.current.distanceKm).toBe(0)
  })

  it('freezes time and stops the GPS while paused, then continues', () => {
    const gps = installFakeGeolocation()
    const { result } = renderHook(() => useTracker())
    act(() => result.current.start())
    tick(10_000)
    act(() => result.current.pause())
    expect(result.current.status).toBe('paused')
    expect(gps.clearWatch).toHaveBeenCalledWith(1)
    tick(20_000)
    expect(result.current.durationSec).toBe(10)
    act(() => result.current.resume())
    expect(gps.watchPosition).toHaveBeenCalledTimes(2)
    tick(5000)
    expect(result.current.durationSec).toBe(15)
  })

  it('does not count travel while paused', () => {
    const gps = installFakeGeolocation()
    const { result } = renderHook(() => useTracker())
    const a = { lat: 9.03, lng: 38.74 }
    const b = { lat: 9.031, lng: 38.74 }
    const c = { lat: 9.05, lng: 38.74 }
    const d = { lat: 9.051, lng: 38.74 }

    act(() => result.current.start())
    act(() => gps.emit(a.lat, a.lng))
    act(() => gps.emit(b.lat, b.lng))
    act(() => result.current.pause())
    act(() => result.current.resume())
    act(() => gps.emit(c.lat, c.lng))
    act(() => gps.emit(d.lat, d.lng))

    expect(result.current.distanceKm).toBeCloseTo(distanceKm(a, b) + distanceKm(c, d), 9)
  })

  it('finishes with the final numbers on stop', () => {
    const gps = installFakeGeolocation()
    const { result } = renderHook(() => useTracker())
    act(() => result.current.start())
    act(() => gps.emit(9.03, 38.74))
    act(() => gps.emit(9.031, 38.74))
    tick(8000)
    act(() => result.current.stop())
    const { distanceKm: km, durationSec } = result.current
    expect(result.current.status).toBe('finished')
    expect(durationSec).toBe(8)
    expect(km).toBeGreaterThan(0)
    tick(30_000)
    expect(result.current.durationSec).toBe(8)
    expect(result.current.distanceKm).toBe(km)
  })

  it('resets to idle with zeros', () => {
    const gps = installFakeGeolocation()
    const { result } = renderHook(() => useTracker())
    act(() => result.current.start())
    act(() => gps.emit(9.03, 38.74))
    act(() => gps.emit(9.031, 38.74))
    tick(3000)
    act(() => result.current.stop())
    act(() => result.current.reset())
    expect(result.current).toMatchObject({
      status: 'idle',
      startedAt: null,
      distanceKm: 0,
      durationSec: 0,
    })
  })

  it('keeps the fixes when start is pressed again while running', () => {
    const gps = installFakeGeolocation()
    const { result } = renderHook(() => useTracker())
    act(() => result.current.start())
    act(() => gps.emit(9.03, 38.74))
    act(() => gps.emit(9.031, 38.74))
    const km = result.current.distanceKm
    act(() => result.current.start())
    expect(result.current.distanceKm).toBe(km)
    expect(result.current.status).toBe('running')
  })

  it('keeps timing when location is denied and reports the error', () => {
    const gps = installFakeGeolocation()
    const { result } = renderHook(() => useTracker())
    act(() => result.current.start())
    act(() => gps.fail(1))
    tick(4000)
    expect(result.current.error).toBe('denied')
    expect(result.current.status).toBe('running')
    expect(result.current.durationSec).toBe(4)
    expect(result.current.distanceKm).toBe(0)
  })

  it('keeps timing when the browser has no geolocation', () => {
    const { result } = renderHook(() => useTracker())
    act(() => result.current.start())
    tick(3000)
    expect(result.current.error).toBe('unsupported')
    expect(result.current.durationSec).toBe(3)
  })
})
