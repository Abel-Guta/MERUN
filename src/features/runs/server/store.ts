import 'server-only'
import { getSupabase } from '@/shared/server/supabase'
import { mockRuns } from '../mock-runs'
import type { Run } from '../types'
import { toRun } from './to-run'
import type { NewRun } from './validate'

// In-memory store seeded from the mock data. It lives on globalThis so dev-mode
// module reloads do not reset it, but it is per server instance and is lost on
// restart, so created runs do not persist (or sync across serverless
// instances) until a database replaces it.
const globalStore = globalThis as typeof globalThis & { __merunRuns?: Run[] }
const store = (globalStore.__merunRuns ??= [...mockRuns])

// No auth yet, so every created run belongs to the first seeded user.
const currentUser = store[0].user

export type ListResult =
  | { ok: true; items: Run[]; nextCursor: string | null }
  | { ok: false; code: 'invalid_cursor' }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// The date goes into a PostgREST filter string, so it must match this exactly.
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$/

// The cursor carries the raw database date next to the id, so the next page
// needs no lookup. Raw on purpose: Postgres keeps microseconds, a JS Date would
// round them to milliseconds and could skip or repeat runs across pages.
function encodeCursor(date: string, id: string): string {
  return Buffer.from(JSON.stringify({ date, id })).toString('base64url')
}

function decodeCursor(cursor: string): { date: string; id: string } | null {
  try {
    const value: unknown = JSON.parse(Buffer.from(cursor, 'base64url').toString())
    if (typeof value !== 'object' || value === null) return null
    const { date, id } = value as Record<string, unknown>
    if (typeof date !== 'string' || !TIMESTAMP.test(date)) return null
    if (typeof id !== 'string' || !UUID.test(id)) return null
    return { date, id }
  } catch {
    return null
  }
}

const USERNAME = /^[A-Za-z0-9_]{1,30}$/

// ilike treats _ and % as wildcards, and usernames may contain _.
function exactIlike(username: string): string {
  return username.replace(/[\\%_]/g, '\\$&')
}

export async function listRuns(options: {
  limit: number
  cursor?: string
  username?: string
}): Promise<ListResult> {
  // !inner makes the username filter drop runs instead of just blanking the profile.
  let query = getSupabase()
    .from('runs')
    .select(
      'id, title, distance_km, duration_sec, date, location, notes, profiles!inner(id, name, username, avatar_url)',
    )
    .order('date', { ascending: false })
    .order('id', { ascending: false })
    .limit(options.limit + 1)

  if (options.username !== undefined) {
    if (!USERNAME.test(options.username)) return { ok: true, items: [], nextCursor: null }
    query = query.ilike('profiles.username', exactIlike(options.username))
  }

  if (options.cursor !== undefined) {
    const cursor = decodeCursor(options.cursor)
    if (!cursor) return { ok: false, code: 'invalid_cursor' }
    query = query.or(
      `date.lt."${cursor.date}",and(date.eq."${cursor.date}",id.lt.${cursor.id})`,
    )
  }

  const { data, error } = await query
  if (error) throw new Error(`Could not list runs: ${error.message}`)

  const items = data.slice(0, options.limit).map((row) => toRun(row))
  let nextCursor: string | null = null
  if (data.length > options.limit) {
    // toRun has already checked that these fields are strings.
    const { date, id } = data[options.limit - 1] as { date: string; id: string }
    nextCursor = encodeCursor(date, id)
  }
  return { ok: true, items, nextCursor }
}

export function getRun(id: string): Run | undefined {
  return store.find((run) => run.id === id)
}

export async function userExists(username: string): Promise<boolean> {
  if (!USERNAME.test(username)) return false
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id')
    .ilike('username', exactIlike(username))
    .limit(1)
  if (error) throw new Error(`Could not look up user: ${error.message}`)
  return data.length > 0
}

export function createRun(input: NewRun): Run {
  const run: Run = { id: crypto.randomUUID(), user: currentUser, ...input }
  store.push(run)
  return run
}
