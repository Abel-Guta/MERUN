import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | undefined

// Lazy so importing this module never throws at build time when the env vars
// are absent (tests, CI); the failure surfaces on first use instead.
export function getSupabase(): SupabaseClient {
  if (client) return client

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY must be set.')
  }

  // The secret key bypasses row level security, so it must never leave the
  // server. Session persistence is off because there is no user session here.
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  return client
}
