import { describe, expect, it } from 'vitest'
import { distanceKm, toPoint, totalDistanceKm } from '../geo'

const addis = { lat: 9.03, lng: 38.74 }

describe('distanceKm', () => {
  it('is 0 for the same point', () => {
    expect(distanceKm(addis, addis)).toBe(0)
  })

  it('measures one degree of latitude as about 111.19 km', () => {
    expect(distanceKm({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeCloseTo(111.19, 1)
  })

  it('is the same in both directions', () => {
    const other = { lat: 9.04, lng: 38.75 }
    expect(distanceKm(addis, other)).toBe(distanceKm(other, addis))
  })

  it('measures a short hop of about 100 m', () => {
    // 0.0009 degrees of latitude is about 100 m
    const km = distanceKm(addis, { lat: addis.lat + 0.0009, lng: addis.lng })
    expect(km).toBeGreaterThan(0.099)
    expect(km).toBeLessThan(0.101)
  })

  it('handles opposite sides of the earth without NaN', () => {
    const km = distanceKm({ lat: 0, lng: 0 }, { lat: 0, lng: 180 })
    expect(Number.isFinite(km)).toBe(true)
    expect(km).toBeCloseTo(20015.09, 0)
  })

  it.each([
    ['NaN latitude', { lat: NaN, lng: 0 }],
    ['Infinity longitude', { lat: 0, lng: Infinity }],
    ['latitude out of range', { lat: 91, lng: 0 }],
    ['longitude out of range', { lat: 0, lng: -181 }],
    ['missing field', { lat: 0 }],
    ['string coordinates', { lat: '1', lng: '2' }],
    ['null', null],
    ['a string', 'here'],
    ['an array', [1, 2]],
    ['undefined', undefined],
  ])('returns 0 for %s', (_name, bad) => {
    expect(distanceKm(bad, addis)).toBe(0)
    expect(distanceKm(addis, bad)).toBe(0)
  })
})

describe('toPoint', () => {
  it('accepts a valid point', () => {
    expect(toPoint(addis)).toEqual(addis)
  })

  it('rejects garbage', () => {
    expect(toPoint(null)).toBeNull()
    expect(toPoint({ lat: 1 })).toBeNull()
  })
})

describe('totalDistanceKm', () => {
  const fix = (lat: number, lng: number, accuracy = 5) => ({ lat, lng, accuracy })

  it('is 0 for an empty list, one fix and non-array input', () => {
    expect(totalDistanceKm([])).toBe(0)
    expect(totalDistanceKm([fix(9.03, 38.74)])).toBe(0)
    expect(totalDistanceKm(null)).toBe(0)
    expect(totalDistanceKm('path')).toBe(0)
    expect(totalDistanceKm({ length: 2 })).toBe(0)
  })

  it('matches distanceKm for two accepted fixes', () => {
    const a = fix(9.03, 38.74)
    const b = fix(9.04, 38.74)
    expect(totalDistanceKm([a, b])).toBe(distanceKm(a, b))
  })

  it('sums the hops along the route', () => {
    const a = fix(9.03, 38.74)
    const b = fix(9.04, 38.74)
    const c = fix(9.04, 38.75)
    expect(totalDistanceKm([a, b, c])).toBeCloseTo(distanceKm(a, b) + distanceKm(b, c), 9)
  })

  it('ignores fixes with poor accuracy', () => {
    const a = fix(9.03, 38.74)
    expect(totalDistanceKm([a, fix(9.04, 38.74, 50), fix(9.05, 38.74, 31)])).toBe(0)
  })

  it('does not count a stationary wobble of about 2 m', () => {
    const fixes = Array.from({ length: 60 }, (_, i) =>
      fix(9.03 + (i % 2 === 0 ? 0.000018 : -0.000018), 38.74),
    )
    expect(totalDistanceKm(fixes)).toBe(0)
  })

  it('still counts slow real movement of about 1 m per fix', () => {
    const fixes = Array.from({ length: 11 }, (_, i) => fix(9.03 + i * 0.00001, 38.74))
    const km = totalDistanceKm(fixes)
    expect(km).toBeGreaterThan(0)
    expect(km).toBeCloseTo(distanceKm(fixes[0], fixes[10]), 6)
  })

  it('skips garbage items and counts the good ones', () => {
    const a = fix(9.03, 38.74)
    const b = fix(9.04, 38.74)
    const garbage = [null, 'x', { lat: NaN, lng: 0, accuracy: 5 }, { lat: 1, lng: 1 }, fix(1, 1, -1)]
    expect(totalDistanceKm([a, ...garbage, b])).toBe(distanceKm(a, b))
  })
})
