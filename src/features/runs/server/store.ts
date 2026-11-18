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

function newestFirst(a: Run, b: Run): number {
  return b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
}

export type ListResult =
  | { ok: true; items: Run[]; nextCursor: string | null }
  | { ok: false; code: 'invalid_cursor' }

export async function listRuns(options: { limit: number }): Promise<Run[]> {
  const { data, error } = await getSupabase()
    .from('runs')
    .select(
      'id, title, distance_km, duration_sec, date, location, notes, profiles(id, name, username, avatar_url)',
    )
    .order('date', { ascending: false })
    .order('id', { ascending: false })
    .limit(options.limit)

  if (error) throw new Error(`Could not list runs: ${error.message}`)
  return data.map((row) => toRun(row))
}

export function listRunsInMemory(options: {
  limit: number
  cursor?: string
  username?: string
}): ListResult {
  const username = options.username?.toLowerCase()
  const sorted = store
    .filter((run) => username === undefined || run.user.username.toLowerCase() === username)
    .sort(newestFirst)

  let start = 0
  if (options.cursor !== undefined) {
    const index = sorted.findIndex((run) => run.id === options.cursor)
    if (index === -1) return { ok: false, code: 'invalid_cursor' }
    start = index + 1
  }

  const items = sorted.slice(start, start + options.limit)
  const hasMore = start + options.limit < sorted.length
  return { ok: true, items, nextCursor: hasMore ? items[items.length - 1].id : null }
}

export function getRun(id: string): Run | undefined {
  return store.find((run) => run.id === id)
}

export function userExists(username: string): boolean {
  const lower = username.toLowerCase()
  return store.some((run) => run.user.username.toLowerCase() === lower)
}

export function createRun(input: NewRun): Run {
  const run: Run = { id: crypto.randomUUID(), user: currentUser, ...input }
  store.push(run)
  return run
}
