import type { Run, User } from '../types'

export interface RunsPage {
  items: Run[]
  nextCursor: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value !== ''
}

function parseUser(value: unknown): User | null {
  if (!isRecord(value)) return null
  const { id, name, username, avatarUrl } = value
  if (!nonEmptyString(id) || !nonEmptyString(name) || !nonEmptyString(username)) return null
  if (typeof avatarUrl !== 'string') return null
  return { id, name, username, avatarUrl }
}

// Numbers and dates are only checked for type here; the display helpers in
// format.ts own range checks and fallbacks.
export function parseRun(value: unknown): Run | null {
  if (!isRecord(value)) return null
  const { id, title, distanceKm, durationSec, date, location, notes } = value
  const user = parseUser(value.user)

  if (!nonEmptyString(id) || user === null) return null
  if (typeof title !== 'string' || typeof location !== 'string') return null
  if (typeof distanceKm !== 'number' || typeof durationSec !== 'number') return null
  if (typeof date !== 'string') return null
  if (notes !== undefined && typeof notes !== 'string') return null

  return {
    id,
    user,
    title,
    distanceKm,
    durationSec,
    date,
    location,
    ...(notes !== undefined && { notes }),
  }
}

// A malformed envelope is an error (null). A malformed item is dropped so one
// bad run does not blank the whole feed.
export function parseRunsPage(value: unknown): RunsPage | null {
  if (!isRecord(value) || !Array.isArray(value.items)) return null
  const { nextCursor } = value
  if (nextCursor !== null && !nonEmptyString(nextCursor)) return null

  const items = value.items.flatMap((item: unknown) => {
    const run = parseRun(item)
    return run === null ? [] : [run]
  })
  return { items, nextCursor }
}
