import { parseRunsPage, type RunsPage } from './parse'

export async function fetchRuns(options: {
  limit: number
  cursor?: string
  signal?: AbortSignal
}): Promise<RunsPage> {
  const params = new URLSearchParams({ limit: String(options.limit) })
  if (options.cursor !== undefined) params.set('cursor', options.cursor)

  const response = await fetch(`/api/runs?${params}`, { signal: options.signal })
  if (!response.ok) throw new Error(`Runs request failed with status ${response.status}`)

  const page = parseRunsPage(await response.json().catch(() => null))
  if (page === null) throw new Error('Runs response had an unexpected shape')
  return page
}
