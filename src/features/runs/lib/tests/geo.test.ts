import { describe, expect, it } from 'vitest'
import { distanceKm, toPoint } from '../geo'

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
