// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Run } from '../../types'
import { Feed } from '../Feed'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function makeRun(id: string): Run {
  return {
    id,
    user: { id: 'u1', name: 'Abel Guta', username: 'abel', avatarUrl: '' },
    title: `Run ${id}`,
    distanceKm: 5,
    durationSec: 1500,
    date: '2026-11-11T06:30:00Z',
    location: 'Addis Ababa',
  }
}

function stubFetch(response: Promise<Response>) {
  const fetchMock = vi.fn().mockReturnValue(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function page(ids: string[], nextCursor: string | null = null) {
  return Response.json({ items: ids.map(makeRun), nextCursor })
}

describe('Feed: first load', () => {
  it('starts busy, with a spoken loading message and no cards', () => {
    stubFetch(new Promise(() => {}))
    render(<Feed />)

    const feed = screen.getByRole('region', { name: 'Recent runs' })
    expect(feed.getAttribute('aria-busy')).toBe('true')
    expect(screen.getByText('Loading runs')).not.toBeNull()
    expect(screen.queryAllByRole('article')).toHaveLength(0)
  })

  it('shows a card per run and announces the count', async () => {
    stubFetch(Promise.resolve(page(['r1', 'r2'])))
    render(<Feed />)

    expect(await screen.findByText('Showing 2 runs')).not.toBeNull()
    const feed = screen.getByRole('region', { name: 'Recent runs' })
    expect(feed.getAttribute('aria-busy')).toBe('false')
    expect(within(feed).getAllByRole('article')).toHaveLength(2)
    expect(screen.queryByText('Loading runs')).toBeNull()
  })

  it('asks the API for the first page of 10', async () => {
    const fetchMock = stubFetch(Promise.resolve(page(['r1'])))
    render(<Feed />)
    await screen.findByText('Showing 1 runs')
    expect(fetchMock.mock.calls[0][0]).toBe('/api/runs?limit=10')
  })

  it('shows an empty message when there are no runs', async () => {
    stubFetch(Promise.resolve(page([])))
    render(<Feed />)
    expect(await screen.findByText('No runs yet.')).not.toBeNull()
    expect(screen.queryAllByRole('article')).toHaveLength(0)
  })
})

describe('Feed: errors and retry', () => {
  it('shows a fixed alert with a retry button when the request fails', async () => {
    stubFetch(Promise.resolve(new Response('stack trace here', { status: 500 })))
    render(<Feed />)

    const alert = await screen.findByRole('alert')
    expect(within(alert).getByText('Could not load runs.')).not.toBeNull()
    expect(within(alert).getByRole('button', { name: 'Try again' })).not.toBeNull()
    expect(screen.queryByText(/stack trace/)).toBeNull()
    expect(screen.getByRole('region', { name: 'Recent runs' }).getAttribute('aria-busy')).toBe(
      'false',
    )
  })

  it('treats a network failure the same way', async () => {
    stubFetch(Promise.reject(new TypeError('Failed to fetch')))
    render(<Feed />)
    expect((await screen.findByRole('alert')).textContent).toContain('Could not load runs.')
  })

  it('treats a response with the wrong shape as an error', async () => {
    stubFetch(Promise.resolve(Response.json({ items: 'nope' })))
    render(<Feed />)
    expect((await screen.findByRole('alert')).textContent).toContain('Could not load runs.')
  })

  it('retries, shows loading again, then recovers', async () => {
    let finishRetry: (response: Response) => void = () => {}
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 500 }))
      .mockReturnValueOnce(new Promise<Response>((resolve) => (finishRetry = resolve)))
    vi.stubGlobal('fetch', fetchMock)
    render(<Feed />)

    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }))

    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByText('Loading runs')).not.toBeNull()
    expect(screen.getByRole('region', { name: 'Recent runs' }).getAttribute('aria-busy')).toBe(
      'true',
    )

    finishRetry(page(['r1']))
    expect(await screen.findByText('Showing 1 runs')).not.toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('can fail again after a retry', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 503 }))
    vi.stubGlobal('fetch', fetchMock)
    render(<Feed />)

    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('alert')).not.toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})

describe('Feed: load more', () => {
  it('shows the button only while the API has a next cursor', async () => {
    stubFetch(Promise.resolve(page(['r1'], 'r1')))
    const { unmount } = render(<Feed />)
    expect(await screen.findByRole('button', { name: 'Load more runs' })).not.toBeNull()
    unmount()

    stubFetch(Promise.resolve(page(['r1'], null)))
    render(<Feed />)
    await screen.findByText('Showing 1 runs')
    expect(screen.queryByRole('button', { name: 'Load more runs' })).toBeNull()
  })

  it('requests the next page with the cursor, appends it, and hides the button at the end', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(page(['r1', 'r2'], 'r2'))
      .mockResolvedValueOnce(page(['r3'], null))
    vi.stubGlobal('fetch', fetchMock)
    render(<Feed />)

    fireEvent.click(await screen.findByRole('button', { name: 'Load more runs' }))

    expect(await screen.findByText('Showing 3 runs')).not.toBeNull()
    expect(fetchMock.mock.calls[1][0]).toBe('/api/runs?limit=10&cursor=r2')
    expect(screen.getAllByRole('article')).toHaveLength(3)
    expect(screen.queryByRole('button', { name: /more runs/ })).toBeNull()
  })

  it('drops runs it already shows', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(page(['r1', 'r2'], 'r2'))
      .mockResolvedValueOnce(page(['r2', 'r3'], null))
    vi.stubGlobal('fetch', fetchMock)
    render(<Feed />)

    fireEvent.click(await screen.findByRole('button', { name: 'Load more runs' }))

    expect(await screen.findByText('Showing 3 runs')).not.toBeNull()
    expect(screen.getAllByRole('article')).toHaveLength(3)
  })

  it('uses aria-disabled while loading, keeps focus, and ignores extra clicks', async () => {
    let finishPage: (response: Response) => void = () => {}
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(page(['r1'], 'r1'))
      .mockReturnValueOnce(new Promise<Response>((resolve) => (finishPage = resolve)))
    vi.stubGlobal('fetch', fetchMock)
    render(<Feed />)

    const button = await screen.findByRole('button', { name: 'Load more runs' })
    button.focus()
    fireEvent.click(button)

    const busy = await screen.findByRole('button', { name: 'Loading more runs' })
    expect(busy.getAttribute('aria-disabled')).toBe('true')
    expect(busy.hasAttribute('disabled')).toBe(false)
    expect(document.activeElement).toBe(busy)
    expect(screen.getByRole('region', { name: 'Recent runs' }).getAttribute('aria-busy')).toBe(
      'true',
    )

    fireEvent.click(busy)
    expect(fetchMock).toHaveBeenCalledTimes(2)

    finishPage(page(['r2'], null))
    expect(await screen.findByText('Showing 2 runs')).not.toBeNull()
  })

  it('keeps the loaded runs when the next page fails, and can retry it', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(page(['r1'], 'r1'))
      .mockResolvedValueOnce(new Response('', { status: 500 }))
      .mockResolvedValueOnce(page(['r2'], null))
    vi.stubGlobal('fetch', fetchMock)
    render(<Feed />)

    fireEvent.click(await screen.findByRole('button', { name: 'Load more runs' }))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toBe('Could not load more runs.')
    expect(screen.getAllByRole('article')).toHaveLength(1)

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByText('Showing 2 runs')).not.toBeNull()
    expect(fetchMock.mock.calls[2][0]).toBe('/api/runs?limit=10&cursor=r1')
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
