import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchRuns } from '../api'

const run = {
  id: 'r1',
  user: { id: 'u1', name: 'Abel', username: 'abel', avatarUrl: '' },
  title: 't',
  distanceKm: 1,
  durationSec: 1,
  date: '2026-11-11',
  location: 'l',
}

function mockFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => vi.unstubAllGlobals())

describe('fetchRuns', () => {
  it('requests the limit and cursor and returns the parsed page', async () => {
    const fetchMock = mockFetch(Response.json({ items: [run], nextCursor: null }))
    const signal = new AbortController().signal

    const page = await fetchRuns({ limit: 10, cursor: 'r0', signal })

    expect(page).toEqual({ items: [run], nextCursor: null })
    expect(fetchMock).toHaveBeenCalledWith('/api/runs?limit=10&cursor=r0', { signal })
  })

  it('omits the cursor on the first page', async () => {
    const fetchMock = mockFetch(Response.json({ items: [], nextCursor: null }))
    await fetchRuns({ limit: 10 })
    expect(fetchMock.mock.calls[0][0]).toBe('/api/runs?limit=10')
  })

  it('throws on a non-OK status', async () => {
    mockFetch(new Response('boom', { status: 500 }))
    await expect(fetchRuns({ limit: 10 })).rejects.toThrow('status 500')
  })

  it('throws on a body that is not JSON', async () => {
    mockFetch(new Response('<html>', { status: 200 }))
    await expect(fetchRuns({ limit: 10 })).rejects.toThrow('unexpected shape')
  })

  it('throws on the wrong shape', async () => {
    mockFetch(Response.json({ items: 'nope' }))
    await expect(fetchRuns({ limit: 10 })).rejects.toThrow('unexpected shape')
  })
})
