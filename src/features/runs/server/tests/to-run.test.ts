import { describe, expect, it } from 'vitest'
import { toRun } from '../to-run'

const validRow = {
  id: '6f1c1f0e-0000-4000-8000-000000000001',
  title: 'Morning loop',
  distance_km: 5.2,
  duration_sec: 1680,
  date: '2026-11-16T10:00:00+00:00',
  location: 'Bole, Addis Ababa',
  notes: 'Felt good',
  profiles: {
    id: '6f1c1f0e-0000-4000-8000-0000000000aa',
    name: 'Abel',
    username: 'abel',
    avatar_url: 'https://i.pravatar.cc/150?img=1',
  },
}

describe('toRun', () => {
  it('maps a valid row to a Run', () => {
    expect(toRun(validRow)).toEqual({
      id: validRow.id,
      user: {
        id: validRow.profiles.id,
        name: 'Abel',
        username: 'abel',
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
      },
      title: 'Morning loop',
      distanceKm: 5.2,
      durationSec: 1680,
      date: '2026-11-16T10:00:00.000Z',
      location: 'Bole, Addis Ababa',
      notes: 'Felt good',
    })
  })

  it('normalises the date to the Z form', () => {
    expect(toRun({ ...validRow, date: '2026-11-16T13:00:00+03:00' }).date).toBe(
      '2026-11-16T10:00:00.000Z',
    )
  })

  it('leaves notes out when the column is null', () => {
    expect('notes' in toRun({ ...validRow, notes: null })).toBe(false)
  })

  it.each([
    ['null', null],
    ['a string', 'run'],
    ['an array', []],
    ['a missing profile', { ...validRow, profiles: undefined }],
    ['a null profile', { ...validRow, profiles: null }],
    ['a non-numeric distance', { ...validRow, distance_km: '5.2' }],
    ['a NaN duration', { ...validRow, duration_sec: Number.NaN }],
    ['a zero duration', { ...validRow, duration_sec: 0 }],
    ['an unparseable date', { ...validRow, date: 'yesterday' }],
    ['a non-string notes value', { ...validRow, notes: 42 }],
    ['an empty title', { ...validRow, title: '' }],
  ])('throws on %s', (_label, row) => {
    expect(() => toRun(row)).toThrow()
  })
})
