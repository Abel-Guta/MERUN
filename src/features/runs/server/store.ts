import 'server-only'
import { getSupabase } from '@/shared/server/supabase'
import type { Run } from '../types'
import { toRun } from './to-run'
import type { NewRun } from './validate'

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

export async function getRun(id: string): Promise<Run | undefined> {
  // A non-UUID id makes Postgres throw, which would surface as a 500 instead of a 404.
  if (!UUID.test(id)) return undefined
  const { data, error } = await getSupabase()
    .from('runs')
    .select(
      'id, title, distance_km, duration_sec, date, location, notes, profiles!inner(id, name, username, avatar_url)',
    )
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(`Could not get run: ${error.message}`)
  return data ? toRun(data) : undefined
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

// TEMPORARY MOCK: there is no auth yet, so every new run is attributed to the
// abel profile. Delete this function when auth is built; createRun will then
// take the profile id from the current session.
async function currentProfileId(): Promise<string> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id')
    .eq('username', 'abel')
    .maybeSingle()
  if (error) throw new Error(`Could not look up the current profile: ${error.message}`)
  if (!data) throw new Error('The abel profile does not exist.')
  return data.id
}

export async function createRun(input: NewRun): Promise<Run> {
  const { data, error } = await getSupabase()
    .from('runs')
    .insert({
      profile_id: await currentProfileId(),
      title: input.title,
      distance_km: input.distanceKm,
      duration_sec: input.durationSec,
      date: input.date,
      location: input.location,
      notes: input.notes ?? null,
    })
    .select(
      'id, title, distance_km, duration_sec, date, location, notes, profiles!inner(id, name, username, avatar_url)',
    )
    .single()
  if (error) throw new Error(`Could not create run: ${error.message}`)
  return toRun(data)
}
