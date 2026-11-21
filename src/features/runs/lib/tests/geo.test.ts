import { describe, expect, it } from 'vitest'
import { distanceKm, totalDistanceKm } from '../geo'

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
})

describe('totalDistanceKm', () => {
  const fix = (lat: number, lng: number, accuracy = 5) => ({ lat, lng, accuracy })

  it('is 0 for an empty list and for one fix', () => {
    expect(totalDistanceKm([])).toBe(0)
    expect(totalDistanceKm([fix(9.03, 38.74)])).toBe(0)
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
})
