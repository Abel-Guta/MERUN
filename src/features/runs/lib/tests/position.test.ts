import { describe, expect, it } from 'vitest'
import { toFix } from '../position'

const position = (coords: Record<string, unknown>) => ({ coords, timestamp: 0 })
const valid = { latitude: 9.03, longitude: 38.74, accuracy: 5 }

describe('toFix', () => {
  it('renames the browser fields to a Fix', () => {
    expect(toFix(position(valid))).toEqual({ lat: 9.03, lng: 38.74, accuracy: 5 })
  })

  it('accepts accuracy 0', () => {
    expect(toFix(position({ ...valid, accuracy: 0 }))).toEqual({ lat: 9.03, lng: 38.74, accuracy: 0 })
  })

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['a string', 'here'],
    ['a number', 5],
    ['an array', []],
    ['no coords', {}],
    ['null coords', { coords: null }],
    ['string coords', { coords: 'x' }],
  ])('returns null for %s', (_name, bad) => {
    expect(toFix(bad)).toBeNull()
  })

  it.each([
    ['NaN latitude', { ...valid, latitude: NaN }],
    ['Infinity longitude', { ...valid, longitude: Infinity }],
    ['NaN accuracy', { ...valid, accuracy: NaN }],
    ['latitude out of range', { ...valid, latitude: 91 }],
    ['longitude out of range', { ...valid, longitude: -181 }],
    ['negative accuracy', { ...valid, accuracy: -1 }],
    ['string accuracy', { ...valid, accuracy: '5' }],
    ['missing latitude', { longitude: 38.74, accuracy: 5 }],
    ['missing accuracy', { latitude: 9.03, longitude: 38.74 }],
  ])('returns null for %s', (_name, coords) => {
    expect(toFix(position(coords))).toBeNull()
  })
})
