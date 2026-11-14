import type { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

type Handlers = typeof import('../handlers')

// The store keeps state on globalThis, so reset both it and the module cache
// to give every test the seeded data.
let handlers: Handlers

beforeEach(async () => {
  delete (globalThis as { __merunRuns?: unknown }).__merunRuns
  vi.resetModules()
  handlers = await import('../handlers')
})

function listRequest(query = ''): NextRequest {
  const url = new URL(`http://test/api/runs${query}`)
  return { nextUrl: url } as NextRequest
}

function postRequest(body: string): Request {
  return new Request('http://test/api/runs', { method: 'POST', body })
}

const newRun = {
  title: 'Evening jog',
  location: 'Bole',
  distanceKm: 3,
  durationSec: 1000,
  date: '2026-01-01T10:00:00Z',
}

describe('GET /api/runs', () => {
  it('returns runs newest first', async () => {
    const body = await handlers.listRunsHandler(listRequest()).json()
    const dates = body.items.map((run: { date: string }) => run.date)
    expect(dates).toEqual([...dates].sort().reverse())
  })

  it('paginates with a cursor and ends with nextCursor null', async () => {
    const first = await handlers.listRunsHandler(listRequest('?limit=2')).json()
    expect(first.items).toHaveLength(2)
    expect(first.nextCursor).toBe(first.items[1].id)

    const seen = new Set<string>(first.items.map((run: { id: string }) => run.id))
    let cursor: string | null = first.nextCursor
    while (cursor !== null) {
      const page = await handlers.listRunsHandler(listRequest(`?limit=2&cursor=${cursor}`)).json()
      for (const run of page.items) {
        expect(seen.has(run.id)).toBe(false)
        seen.add(run.id)
      }
      cursor = page.nextCursor
    }
    const all = await handlers.listRunsHandler(listRequest('?limit=50')).json()
    expect(seen.size).toBe(all.items.length)
  })

  it('rejects a bad limit with invalid_query', async () => {
    const response = handlers.listRunsHandler(listRequest('?limit=0'))
    expect(response.status).toBe(400)
    expect((await response.json()).error.code).toBe('invalid_query')
  })

  it('rejects an unknown cursor with invalid_cursor', async () => {
    const response = handlers.listRunsHandler(listRequest('?cursor=nope'))
    expect(response.status).toBe(400)
    expect((await response.json()).error.code).toBe('invalid_cursor')
  })
})

describe('POST /api/runs', () => {
  it('creates a run, returns 201 with Location, and makes it fetchable', async () => {
    const response = await handlers.createRunHandler(postRequest(JSON.stringify(newRun)))
    expect(response.status).toBe(201)
    const run = await response.json()
    expect(run).toMatchObject({ ...newRun, date: '2026-01-01T10:00:00.000Z' })
    expect(response.headers.get('Location')).toBe(`/api/runs/${run.id}`)

    const fetched = await handlers.getRunHandler(new Request('http://test'), {
      params: Promise.resolve({ id: run.id }),
    })
    expect(fetched.status).toBe(200)
    expect(await fetched.json()).toEqual(run)
  })

  it('returns 400 invalid_json for a broken body', async () => {
    const response = await handlers.createRunHandler(postRequest('{nope'))
    expect(response.status).toBe(400)
    expect((await response.json()).error.code).toBe('invalid_json')
  })

  it('returns 422 with field errors for an invalid run', async () => {
    const response = await handlers.createRunHandler(postRequest('{}'))
    expect(response.status).toBe(422)
    const { error } = await response.json()
    expect(error.code).toBe('validation_failed')
    expect(Object.keys(error.fields)).toContain('title')
  })
})

describe('GET /api/runs/:id', () => {
  it('returns 404 for an unknown id', async () => {
    const response = await handlers.getRunHandler(new Request('http://test'), {
      params: Promise.resolve({ id: 'missing' }),
    })
    expect(response.status).toBe(404)
    expect((await response.json()).error.code).toBe('not_found')
  })
})

describe('GET /api/users/:username/runs', () => {
  it('lists only that user’s runs, case-insensitively', async () => {
    const response = await handlers.listUserRunsHandler(listRequest(), {
      params: Promise.resolve({ username: 'ABEL' }),
    })
    const body = await response.json()
    expect(body.items.length).toBeGreaterThan(0)
    for (const run of body.items) expect(run.user.username).toBe('abel')
  })

  it('returns 404 for an unknown user', async () => {
    const response = await handlers.listUserRunsHandler(listRequest(), {
      params: Promise.resolve({ username: 'ghost' }),
    })
    expect(response.status).toBe(404)
  })
})
