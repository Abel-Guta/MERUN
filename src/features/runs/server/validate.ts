import type { FieldErrors } from '@/shared/server/http'
import type { Run } from '../types'

export type NewRun = Omit<Run, 'id' | 'user'>
export type Parsed<T> = { ok: true; value: T } | { ok: false; fields: FieldErrors }

export const DEFAULT_LIMIT = 20
export const MAX_LIMIT = 50

// Same upper bounds as the display helpers in lib/format.ts, so anything the
// API accepts can also be rendered.
const MAX_DISTANCE_KM = 100_000
const MAX_DURATION_SEC = 365 * 24 * 60 * 60
const MAX_TITLE = 100
const MAX_LOCATION = 100
const MAX_NOTES = 500
const MAX_FUTURE_MS = 24 * 60 * 60 * 1000 // slack for timezones

// Date.parse accepts strings like "5", so require an ISO-style date up front.
const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T|$)/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requiredText(value: unknown, max: number): { value: string } | { error: string } {
  if (typeof value !== 'string') return { error: 'Must be a string.' }
  const trimmed = value.trim()
  if (trimmed === '') return { error: 'Required.' }
  if (trimmed.length > max) return { error: `Must be at most ${max} characters.` }
  return { value: trimmed }
}

export function parseNewRun(input: unknown, now: number = Date.now()): Parsed<NewRun> {
  if (!isRecord(input)) {
    return { ok: false, fields: { body: 'Must be a JSON object.' } }
  }

  const fields: FieldErrors = {}

  const title = requiredText(input.title, MAX_TITLE)
  if ('error' in title) fields.title = title.error

  const location = requiredText(input.location, MAX_LOCATION)
  if ('error' in location) fields.location = location.error

  const { distanceKm, durationSec } = input
  if (typeof distanceKm !== 'number' || !Number.isFinite(distanceKm) || distanceKm <= 0) {
    fields.distanceKm = 'Must be a number greater than 0.'
  } else if (distanceKm > MAX_DISTANCE_KM) {
    fields.distanceKm = `Must be at most ${MAX_DISTANCE_KM}.`
  }

  if (
    typeof durationSec !== 'number' ||
    !Number.isInteger(durationSec) ||
    durationSec <= 0
  ) {
    fields.durationSec = 'Must be a whole number of seconds greater than 0.'
  } else if (durationSec > MAX_DURATION_SEC) {
    fields.durationSec = `Must be at most ${MAX_DURATION_SEC}.`
  }

  let date = ''
  if (typeof input.date !== 'string' || !ISO_DATE.test(input.date)) {
    fields.date = 'Must be an ISO 8601 date string.'
  } else {
    const ms = Date.parse(input.date)
    if (!Number.isFinite(ms)) fields.date = 'Must be a valid date.'
    else if (ms > now + MAX_FUTURE_MS) fields.date = 'Must not be in the future.'
    else date = new Date(ms).toISOString()
  }

  let notes: string | undefined
  if (input.notes !== undefined && input.notes !== null) {
    if (typeof input.notes !== 'string') {
      fields.notes = 'Must be a string.'
    } else {
      const trimmed = input.notes.trim()
      if (trimmed.length > MAX_NOTES) fields.notes = `Must be at most ${MAX_NOTES} characters.`
      else if (trimmed !== '') notes = trimmed
    }
  }

  if (Object.keys(fields).length > 0) return { ok: false, fields }

  return {
    ok: true,
    value: {
      title: (title as { value: string }).value,
      location: (location as { value: string }).value,
      distanceKm: distanceKm as number,
      durationSec: durationSec as number,
      date,
      ...(notes !== undefined && { notes }),
    },
  }
}

export function parseLimit(raw: string | null): Parsed<number> {
  if (raw === null) return { ok: true, value: DEFAULT_LIMIT }
  const limit = /^\d+$/.test(raw) ? Number(raw) : NaN
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    return { ok: false, fields: { limit: `Must be a whole number from 1 to ${MAX_LIMIT}.` } }
  }
  return { ok: true, value: limit }
}
