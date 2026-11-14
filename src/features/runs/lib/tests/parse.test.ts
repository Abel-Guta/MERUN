import { describe, expect, it } from 'vitest'
import { parseRun, parseRunsPage } from '../parse'

const user = { id: 'u1', name: 'Abel', username: 'abel', avatarUrl: 'https://x/a.png' }
const run = {
  id: 'r1',
  user,
  title: 'Easy run',
  distanceKm: 5,
  durationSec: 1500,
  date: '2026-11-11T06:30:00Z',
  location: 'Addis Ababa',
}

describe('parseRun', () => {
  it('accepts a valid run, with or without notes', () => {
    expect(parseRun(run)).toEqual(run)
    expect(parseRun({ ...run, notes: 'fine' })).toEqual({ ...run, notes: 'fine' })
  })

  it('drops unknown fields', () => {
    expect(parseRun({ ...run, extra: 1 })).toEqual(run)
  })

  it.each([
    undefined,
    null,
    'run',
    [],
    {},
    { ...run, id: '' },
    { ...run, id: 1 },
    { ...run, user: null },
    { ...run, user: { ...user, username: '' } },
    { ...run, user: { ...user, avatarUrl: 5 } },
    { ...run, title: 1 },
    { ...run, location: null },
    { ...run, distanceKm: '5' },
    { ...run, durationSec: undefined },
    { ...run, date: 20261111 },
    { ...run, notes: 5 },
  ])('returns null for %j', (value) => {
    expect(parseRun(value)).toBeNull()
  })
})

describe('parseRunsPage', () => {
  it('accepts a valid page', () => {
    expect(parseRunsPage({ items: [run], nextCursor: 'r1' })).toEqual({
      items: [run],
      nextCursor: 'r1',
    })
    expect(parseRunsPage({ items: [], nextCursor: null })).toEqual({ items: [], nextCursor: null })
  })

  it('drops bad items but keeps good ones', () => {
    const page = parseRunsPage({ items: [run, { nope: true }, null], nextCursor: null })
    expect(page?.items).toEqual([run])
  })

  it.each([
    undefined,
    null,
    [],
    {},
    { items: 'x', nextCursor: null },
    { items: [] },
    { items: [], nextCursor: '' },
    { items: [], nextCursor: 5 },
  ])('returns null for a bad envelope %j', (value) => {
    expect(parseRunsPage(value)).toBeNull()
  })
})
