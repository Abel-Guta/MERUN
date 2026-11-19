import { describe, expect, it } from 'vitest'
import {
  distanceLabel,
  durationLabel,
  FALLBACK,
  FALLBACK_LABEL,
  formatDate,
  formatDateLong,
  formatDistance,
  formatDuration,
  formatPace,
  kmTicks,
  MAX_KM_TICKS,
  paceLabel,
} from '../format'

const garbage: unknown[] = [
  undefined,
  null,
  NaN,
  Infinity,
  -Infinity,
  -1,
  '5',
  '',
  {},
  [],
  true,
  () => 1,
  Symbol('x'),
  1n,
]

describe('formatDuration / durationLabel', () => {
  it('formats minutes and seconds', () => {
    expect(formatDuration(1685)).toBe('28:05')
    expect(durationLabel(1685)).toBe('28 minutes 5 seconds')
  })

  it('adds hours when needed', () => {
    expect(formatDuration(3725)).toBe('1:02:05')
    expect(durationLabel(3725)).toBe('1 hour 2 minutes 5 seconds')
  })

  it('treats zero as valid', () => {
    expect(formatDuration(0)).toBe('0:00')
    expect(durationLabel(0)).toBe('0 seconds')
  })

  it('rounds fractional seconds', () => {
    expect(formatDuration(59.6)).toBe('1:00')
  })

  it('uses singular units and skips zero parts', () => {
    expect(durationLabel(3601)).toBe('1 hour 1 second')
  })

  it('rejects values above one year', () => {
    expect(formatDuration(365 * 24 * 3600)).not.toBe(FALLBACK)
    expect(formatDuration(365 * 24 * 3600 + 1)).toBe(FALLBACK)
  })

  it.each(garbage)('falls back for %s', (value) => {
    expect(formatDuration(value)).toBe(FALLBACK)
    expect(durationLabel(value)).toBe(FALLBACK_LABEL)
  })
})

describe('formatDistance / distanceLabel', () => {
  it('uses one decimal', () => {
    expect(formatDistance(5.2)).toBe('5.2 km')
    expect(formatDistance(8)).toBe('8.0 km')
    expect(distanceLabel(5.2)).toBe('5.2 kilometers')
  })

  it('accepts zero and the upper bound only', () => {
    expect(formatDistance(0)).toBe('0.0 km')
    expect(formatDistance(100_000)).toBe('100000.0 km')
    expect(formatDistance(100_001)).toBe(FALLBACK)
  })

  it.each(garbage)('falls back for %s', (value) => {
    expect(formatDistance(value)).toBe(FALLBACK)
    expect(distanceLabel(value)).toBe(FALLBACK_LABEL)
  })
})

describe('kmTicks', () => {
  it('counts whole kilometres', () => {
    expect(kmTicks(5.2)).toBe(5)
    expect(kmTicks(0.9)).toBe(0)
    expect(kmTicks(1)).toBe(1)
  })

  it('caps at the maximum', () => {
    expect(kmTicks(10)).toBe(MAX_KM_TICKS)
    expect(kmTicks(42.2)).toBe(MAX_KM_TICKS)
    expect(kmTicks(100_001)).toBe(0)
  })

  it.each(garbage)('gives no ticks for %s', (value) => {
    expect(kmTicks(value)).toBe(0)
  })
})

describe('formatPace / paceLabel', () => {
  it('derives pace from distance and duration', () => {
    expect(formatPace(5.2, 1685)).toBe('5:24 /km')
    expect(paceLabel(5.2, 1685)).toBe('5 minutes 24 seconds per kilometer')
  })

  it('uses singular units', () => {
    expect(paceLabel(1, 61)).toBe('1 minute 1 second per kilometer')
  })

  it('needs both values above zero', () => {
    expect(formatPace(0, 100)).toBe(FALLBACK)
    expect(formatPace(5, 0)).toBe(FALLBACK)
    expect(paceLabel(0, 100)).toBe(FALLBACK_LABEL)
    expect(paceLabel(5, 0)).toBe(FALLBACK_LABEL)
  })

  it('rejects paces outside 1 s/km to 99:59 /km', () => {
    expect(formatPace(1, 5999)).toBe('99:59 /km')
    expect(formatPace(1, 6000)).toBe(FALLBACK)
    expect(formatPace(100, 10)).toBe(FALLBACK)
  })

  it.each(garbage)('falls back when either argument is %s', (value) => {
    expect(formatPace(value, 1000)).toBe(FALLBACK)
    expect(formatPace(5, value)).toBe(FALLBACK)
    expect(paceLabel(value, 1000)).toBe(FALLBACK_LABEL)
    expect(paceLabel(5, value)).toBe(FALLBACK_LABEL)
  })
})

// Output depends on the runtime locale, so assert shape, not exact text.
describe('formatDate / formatDateLong', () => {
  it('formats a valid ISO date', () => {
    expect(formatDate('2026-11-11T06:30:00Z')).not.toBe(FALLBACK)
    expect(formatDateLong('2026-11-11T06:30:00Z')).toContain('2026')
  })

  // Date.parse is lenient with some strings ('5' becomes a 2001 date), and the
  // contract only asks for a parseable string, so those are not asserted here.
  it('falls back for invalid dates', () => {
    const nonStrings = garbage.filter((value) => typeof value !== 'string')
    for (const value of [...nonStrings, 'not a date', '', '   ', '2026-13-45']) {
      expect(formatDate(value)).toBe(FALLBACK)
      expect(formatDateLong(value)).toBe(FALLBACK_LABEL)
    }
  })
})
