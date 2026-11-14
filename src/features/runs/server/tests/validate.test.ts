import { describe, expect, it } from 'vitest'
import { DEFAULT_LIMIT, MAX_LIMIT, parseLimit, parseNewRun } from '../validate'

const now = Date.parse('2026-11-14T12:00:00Z')
const valid = {
  title: 'Morning run',
  location: 'Addis Ababa',
  distanceKm: 5.2,
  durationSec: 1685,
  date: '2026-11-11T06:30:00Z',
}

function fieldsOf(input: unknown): Record<string, string> {
  const result = parseNewRun(input, now)
  if (result.ok) throw new Error('expected validation to fail')
  return result.fields
}

describe('parseNewRun', () => {
  it('accepts a valid run and normalizes the date', () => {
    expect(parseNewRun({ ...valid, date: '2026-11-11' }, now)).toEqual({
      ok: true,
      value: { ...valid, date: '2026-11-11T00:00:00.000Z' },
    })
  })

  it('trims text and keeps non-empty notes', () => {
    const result = parseNewRun(
      { ...valid, title: '  Run  ', location: ' Here ', notes: '  good  ' },
      now,
    )
    expect(result).toMatchObject({
      ok: true,
      value: { title: 'Run', location: 'Here', notes: 'good' },
    })
  })

  it('omits blank, null or missing notes', () => {
    for (const notes of [undefined, null, '   ']) {
      const result = parseNewRun({ ...valid, notes }, now)
      expect(result.ok && 'notes' in result.value).toBe(false)
    }
  })

  it('ignores unknown fields such as id and user', () => {
    const result = parseNewRun({ ...valid, id: 'x', user: {} }, now)
    expect(result.ok && Object.keys(result.value).sort()).toEqual(
      ['date', 'distanceKm', 'durationSec', 'location', 'title'],
    )
  })

  it.each([undefined, null, 'x', 5, []])('rejects a non-object body %j', (body) => {
    expect(fieldsOf(body)).toEqual({ body: 'Must be a JSON object.' })
  })

  it('reports every bad field at once', () => {
    expect(Object.keys(fieldsOf({})).sort()).toEqual([
      'date',
      'distanceKm',
      'durationSec',
      'location',
      'title',
    ])
  })

  it('validates text fields', () => {
    expect(fieldsOf({ ...valid, title: 5 }).title).toBe('Must be a string.')
    expect(fieldsOf({ ...valid, title: '   ' }).title).toBe('Required.')
    expect(fieldsOf({ ...valid, title: 'x'.repeat(101) }).title).toMatch(/at most 100/)
    expect(fieldsOf({ ...valid, location: 'x'.repeat(101) }).location).toMatch(/at most 100/)
    expect(fieldsOf({ ...valid, notes: 'x'.repeat(501) }).notes).toMatch(/at most 500/)
    expect(fieldsOf({ ...valid, notes: 5 }).notes).toBe('Must be a string.')
  })

  it('validates distance', () => {
    for (const distanceKm of [0, -1, NaN, Infinity, '5', undefined]) {
      expect(fieldsOf({ ...valid, distanceKm })).toHaveProperty('distanceKm')
    }
    expect(fieldsOf({ ...valid, distanceKm: 100_001 }).distanceKm).toMatch(/at most/)
    expect(parseNewRun({ ...valid, distanceKm: 100_000 }, now).ok).toBe(true)
  })

  it('validates duration as a positive whole number', () => {
    for (const durationSec of [0, -5, 1.5, NaN, '60', undefined]) {
      expect(fieldsOf({ ...valid, durationSec })).toHaveProperty('durationSec')
    }
    const year = 365 * 24 * 3600
    expect(fieldsOf({ ...valid, durationSec: year + 1 }).durationSec).toMatch(/at most/)
    expect(parseNewRun({ ...valid, durationSec: year }, now).ok).toBe(true)
  })

  it('validates the date', () => {
    for (const date of ['5', 'yesterday', 20261111, undefined, '2026-13-45']) {
      expect(fieldsOf({ ...valid, date })).toHaveProperty('date')
    }
  })

  it('rejects dates in the future beyond the timezone slack', () => {
    expect(fieldsOf({ ...valid, date: '2026-11-16T00:00:00Z' }).date).toBe(
      'Must not be in the future.',
    )
    expect(parseNewRun({ ...valid, date: '2026-11-15T11:00:00Z' }, now).ok).toBe(true)
  })
})

describe('parseLimit', () => {
  it('defaults when absent', () => {
    expect(parseLimit(null)).toEqual({ ok: true, value: DEFAULT_LIMIT })
  })

  it('accepts 1 to the maximum', () => {
    expect(parseLimit('1')).toEqual({ ok: true, value: 1 })
    expect(parseLimit(String(MAX_LIMIT))).toEqual({ ok: true, value: MAX_LIMIT })
  })

  it.each(['0', String(MAX_LIMIT + 1), '-1', '1.5', 'abc', '', ' 5', '1e1', '+5'])(
    'rejects %j',
    (raw) => {
      expect(parseLimit(raw)).toMatchObject({ ok: false, fields: { limit: expect.any(String) } })
    },
  )
})
