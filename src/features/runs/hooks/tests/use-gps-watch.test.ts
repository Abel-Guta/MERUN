// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useGpsWatch } from '../use-gps-watch'
import { installFakeGeolocation, removeFakeGeolocation } from './fake-geolocation'

afterEach(() => {
  cleanup()
  removeFakeGeolocation()
})

describe('useGpsWatch', () => {
  it('does not watch while inactive', () => {
    const gps = installFakeGeolocation()
    renderHook(() => useGpsWatch(false, vi.fn()))
    expect(gps.watchPosition).not.toHaveBeenCalled()
  })

  it('starts exactly one watch when active', () => {
    const gps = installFakeGeolocation()
    renderHook(() => useGpsWatch(true, vi.fn()))
    expect(gps.watchPosition).toHaveBeenCalledTimes(1)
  })

  it('passes a valid position on as a Fix', () => {
    const gps = installFakeGeolocation()
    const onFix = vi.fn()
    renderHook(() => useGpsWatch(true, onFix))
    act(() => gps.emit(9.03, 38.74, 4))
    expect(onFix).toHaveBeenCalledWith({ lat: 9.03, lng: 38.74, accuracy: 4 })
  })

  it('drops an invalid position', () => {
    const gps = installFakeGeolocation()
    const onFix = vi.fn()
    renderHook(() => useGpsWatch(true, onFix))
    act(() => gps.emit(NaN, 38.74))
    act(() => gps.emitRaw(null))
    expect(onFix).not.toHaveBeenCalled()
  })

  it('reports denied permission', () => {
    const gps = installFakeGeolocation()
    const { result } = renderHook(() => useGpsWatch(true, vi.fn()))
    act(() => gps.fail(1))
    expect(result.current.error).toBe('denied')
  })

  it('reports other failures as unavailable', () => {
    const gps = installFakeGeolocation()
    const { result } = renderHook(() => useGpsWatch(true, vi.fn()))
    act(() => gps.fail(2))
    expect(result.current.error).toBe('unavailable')
    act(() => gps.fail(3))
    expect(result.current.error).toBe('unavailable')
  })

  it('clears the error on the next good fix', () => {
    const gps = installFakeGeolocation()
    const { result } = renderHook(() => useGpsWatch(true, vi.fn()))
    act(() => gps.fail(3))
    expect(result.current.error).toBe('unavailable')
    act(() => gps.emit(9.03, 38.74))
    expect(result.current.error).toBeNull()
  })

  it('stops the watch when it becomes inactive', () => {
    const gps = installFakeGeolocation()
    const onFix = vi.fn()
    const { rerender } = renderHook(({ active }) => useGpsWatch(active, onFix), {
      initialProps: { active: true },
    })
    rerender({ active: false })
    expect(gps.clearWatch).toHaveBeenCalledWith(1)
  })

  it('stops the watch on unmount', () => {
    const gps = installFakeGeolocation()
    const { unmount } = renderHook(() => useGpsWatch(true, vi.fn()))
    unmount()
    expect(gps.clearWatch).toHaveBeenCalledWith(1)
  })

  it('reports unsupported when the browser has no geolocation', () => {
    const { result } = renderHook(() => useGpsWatch(true, vi.fn()))
    expect(result.current.error).toBe('unsupported')
  })
})
