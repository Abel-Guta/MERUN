import 'server-only'
import type { Run } from '../types'

type Row = Record<string, unknown>

function isRow(value: unknown): value is Row {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function text(row: Row, key: string): string {
  const value = row[key]
  if (typeof value !== 'string' || value === '') throw new Error(`Bad row: ${key}`)
  return value
}

function positiveNumber(row: Row, key: string): number {
  const value = row[key]
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new Error(`Bad row: ${key}`)
  }
  return value
}

export function toRun(row: unknown): Run {
  if (!isRow(row)) throw new Error('Bad row: not an object')
  const profile = row.profiles
  if (!isRow(profile)) throw new Error('Bad row: profiles')

  const time = Date.parse(text(row, 'date'))
  if (Number.isNaN(time)) throw new Error('Bad row: date')

  const notes = row.notes
  if (notes != null && typeof notes !== 'string') throw new Error('Bad row: notes')

  return {
    id: text(row, 'id'),
    user: {
      id: text(profile, 'id'),
      name: text(profile, 'name'),
      username: text(profile, 'username'),
      avatarUrl: text(profile, 'avatar_url'),
    },
    title: text(row, 'title'),
    distanceKm: positiveNumber(row, 'distance_km'),
    durationSec: positiveNumber(row, 'duration_sec'),
    date: new Date(time).toISOString(),
    location: text(row, 'location'),
    ...(notes ? { notes } : {}),
  }
}
