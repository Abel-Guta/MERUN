import type { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Run } from '../../types'
import * as handlers from '../handlers'
import * as store from '../store'

// Only the data layer is faked: validation and response building run for real.
vi.mock('../store', () => ({
  listRuns: vi.fn(),
  getRun: vi.fn(),
  createRun: vi.fn(),
  userExists: vi.fn(),
}))

beforeEach(() => {
  vi.resetAllMocks()
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
  it('returns the store result as items and nextCursor', async () => {
    vi.mocked(store.listRuns).mockResolvedValue({ ok: true, items: [], nextCursor: 'abc' })
    const response = await handlers.listRunsHandler(listRequest())
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ items: [], nextCursor: 'abc' })
  })

  it('passes the limit and cursor to the store', async () => {
    vi.mocked(store.listRuns).mockResolvedValue({ ok: true, items: [], nextCursor: null })
    await handlers.listRunsHandler(listRequest('?limit=2&cursor=xyz'))
    expect(store.listRuns).toHaveBeenCalledWith({ limit: 2, cursor: 'xyz', username: undefined })
  })

  it('rejects a bad limit with invalid_query and never calls the store', async () => {
    const response = await handlers.listRunsHandler(listRequest('?limit=0'))
    expect(response.status).toBe(400)
    expect((await response.json()).error.code).toBe('invalid_query')
    expect(store.listRuns).not.toHaveBeenCalled()
  })

  it('maps the store invalid_cursor result to a 400', async () => {
    vi.mocked(store.listRuns).mockResolvedValue({ ok: false, code: 'invalid_cursor' })
    const response = await handlers.listRunsHandler(listRequest('?cursor=nope'))
    expect(response.status).toBe(400)
    expect((await response.json()).error.code).toBe('invalid_cursor')
  })
})

describe('POST /api/runs', () => {
  it('creates a run, returns 201 with Location, and the store result', async () => {
    const created = {
      id: '11111111-1111-4111-8111-111111111111',
      user: { id: 'u1', name: 'Abel Guta', username: 'abel', avatarUrl: 'https://example.com/a.png' },
      ...newRun,
      date: '2026-01-01T10:00:00.000Z',
    }
    vi.mocked(store.createRun).mockResolvedValue(created)

    const response = await handlers.createRunHandler(postRequest(JSON.stringify(newRun)))

    expect(response.status).toBe(201)
    expect(await response.json()).toEqual(created)
    expect(response.headers.get('Location')).toBe(`/api/runs/${created.id}`)
  })

  it('passes the validated run to the store', async () => {
    vi.mocked(store.createRun).mockResolvedValue({} as Run)
    await handlers.createRunHandler(postRequest(JSON.stringify({ ...newRun, title: '  Evening jog  ' })))
    expect(store.createRun).toHaveBeenCalledWith({ ...newRun, title: 'Evening jog', date: '2026-01-01T10:00:00.000Z' })
  })

  it('returns 400 invalid_json for a broken body', async () => {
    const response = await handlers.createRunHandler(postRequest('{nope'))
    expect(response.status).toBe(400)
    expect((await response.json()).error.code).toBe('invalid_json')
    expect(store.createRun).not.toHaveBeenCalled()
  })

  it('returns 422 with field errors for an invalid run', async () => {
    const response = await handlers.createRunHandler(postRequest('{}'))
    expect(response.status).toBe(422)
    const { error } = await response.json()
    expect(error.code).toBe('validation_failed')
    expect(Object.keys(error.fields)).toContain('title')
    expect(store.createRun).not.toHaveBeenCalled()
  })
})

describe('GET /api/runs/:id', () => {
  const id = '11111111-1111-4111-8111-111111111111'
  const context = { params: Promise.resolve({ id }) }

  it('returns the run the store finds', async () => {
    const run = {
      id,
      user: { id: 'u1', name: 'Abel Guta', username: 'abel', avatarUrl: 'https://example.com/a.png' },
      ...newRun,
      date: '2026-01-01T10:00:00.000Z',
    }
    vi.mocked(store.getRun).mockResolvedValue(run)

    const response = await handlers.getRunHandler(new Request('http://test'), context)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(run)
    expect(store.getRun).toHaveBeenCalledWith(id)
  })

  it('returns 404 not_found when the store finds nothing', async () => {
    vi.mocked(store.getRun).mockResolvedValue(undefined)

    const response = await handlers.getRunHandler(new Request('http://test'), context)

    expect(response.status).toBe(404)
    expect((await response.json()).error.code).toBe('not_found')
  })
})

describe('GET /api/users/:username/runs', () => {
  const context = { params: Promise.resolve({ username: 'ABEL' }) }

  it('lists that user’s runs from the store', async () => {
    vi.mocked(store.userExists).mockResolvedValue(true)
    vi.mocked(store.listRuns).mockResolvedValue({ ok: true, items: [], nextCursor: 'abc' })

    const response = await handlers.listUserRunsHandler(listRequest('?limit=2&cursor=xyz'), context)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ items: [], nextCursor: 'abc' })
    expect(store.userExists).toHaveBeenCalledWith('ABEL')
    expect(store.listRuns).toHaveBeenCalledWith({ limit: 2, cursor: 'xyz', username: 'ABEL' })
  })

  it('returns 404 not_found for an unknown user and never lists runs', async () => {
    vi.mocked(store.userExists).mockResolvedValue(false)

    const response = await handlers.listUserRunsHandler(listRequest(), context)

    expect(response.status).toBe(404)
    expect((await response.json()).error.code).toBe('not_found')
    expect(store.listRuns).not.toHaveBeenCalled()
  })

  it('rejects a bad limit with invalid_query', async () => {
    vi.mocked(store.userExists).mockResolvedValue(true)

    const response = await handlers.listUserRunsHandler(listRequest('?limit=0'), context)

    expect(response.status).toBe(400)
    expect((await response.json()).error.code).toBe('invalid_query')
    expect(store.listRuns).not.toHaveBeenCalled()
  })
})
