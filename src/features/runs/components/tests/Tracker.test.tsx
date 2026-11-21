// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installFakeGeolocation, removeFakeGeolocation } from '../../hooks/tests/fake-geolocation'
import { Tracker } from '../Tracker'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(1_000_000)
})

afterEach(() => {
  cleanup()
  removeFakeGeolocation()
  vi.useRealTimers()
})

const press = (name: string) => fireEvent.click(screen.getByRole('button', { name }))

describe('Tracker', () => {
  it('starts ready, with zeros and a Start button', () => {
    installFakeGeolocation()
    render(<Tracker />)
    expect(screen.getByRole('heading', { level: 2, name: 'Track a run' })).toBeTruthy()
    expect(screen.getByRole('status').textContent).toBe('Ready')
    expect(screen.getByText('Time').nextElementSibling?.textContent).toBe('0:00')
    expect(screen.getByText('Distance').nextElementSibling?.textContent).toBe('0.0 km')
    expect(screen.getByRole('button', { name: 'Start' })).toBeTruthy()
  })

  it('counts time and distance while running', () => {
    const gps = installFakeGeolocation()
    render(<Tracker />)
    press('Start')
    expect(screen.getByRole('status').textContent).toBe('Running')
    act(() => gps.emit(9.03, 38.74))
    act(() => gps.emit(9.04, 38.74))
    act(() => {
      vi.advanceTimersByTime(65_000)
    })
    expect(screen.getByText('Time').nextElementSibling?.textContent).toBe('1:05')
    expect(screen.getByText('Distance').nextElementSibling?.textContent).toContain('1.1 km')
  })

  it('freezes while paused', () => {
    installFakeGeolocation()
    render(<Tracker />)
    press('Start')
    act(() => {
      vi.advanceTimersByTime(10_000)
    })
    press('Pause')
    act(() => {
      vi.advanceTimersByTime(30_000)
    })
    expect(screen.getByRole('status').textContent).toBe('Paused')
    expect(screen.getByText('Time').nextElementSibling?.textContent).toBe('0:10')
  })

  it('finishes after confirming, then starts a new run from zero', () => {
    const gps = installFakeGeolocation()
    render(<Tracker />)
    press('Start')
    act(() => gps.emit(9.03, 38.74))
    act(() => gps.emit(9.04, 38.74))
    act(() => {
      vi.advanceTimersByTime(8000)
    })
    press('Stop')
    press('End run')
    expect(screen.getByRole('status').textContent).toBe('Run finished')
    expect(screen.getByText('Time').nextElementSibling?.textContent).toBe('0:08')

    press('New run')
    expect(screen.getByRole('status').textContent).toBe('Ready')
    expect(screen.getByText('Time').nextElementSibling?.textContent).toBe('0:00')
    expect(screen.getByText('Distance').nextElementSibling?.textContent).toContain('0.0 km')
  })

  it('keeps timing and shows no error when location is denied', () => {
    const gps = installFakeGeolocation()
    render(<Tracker />)
    press('Start')
    act(() => gps.fail(1))
    act(() => {
      vi.advanceTimersByTime(4000)
    })
    expect(screen.getByText('Time').nextElementSibling?.textContent).toBe('0:04')
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
