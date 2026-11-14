// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { Run } from '../../types'
import { FeedCard } from '../FeedCard'

// Testing Library only cleans up on its own when test globals are enabled.
afterEach(cleanup)

const run: Run = {
  id: 'r1',
  user: { id: 'u1', name: 'Abel Guta', username: 'abel', avatarUrl: 'https://x/a.png' },
  title: 'Morning easy run',
  distanceKm: 5.2,
  durationSec: 1685,
  date: '2026-11-11T06:30:00Z',
  location: 'Addis Ababa',
  notes: 'Legs felt fresh.',
}

describe('FeedCard', () => {
  it('is an article named by its h3 title', () => {
    render(<FeedCard run={run} />)
    const article = screen.getByRole('article', { name: 'Morning easy run' })
    expect(within(article).getByRole('heading', { level: 3 })).toHaveProperty(
      'textContent',
      'Morning easy run',
    )
  })

  it('shows the stats with spoken labels', () => {
    const { container } = render(<FeedCard run={run} />)
    const stats = container.querySelector('dl') as HTMLElement
    expect(within(stats).getByText('5.2 km').getAttribute('aria-label')).toBe('5.2 kilometers')
    expect(within(stats).getByText('28:05').getAttribute('aria-label')).toBe(
      '28 minutes 5 seconds',
    )
    expect(within(stats).getByText('5:24 /km').getAttribute('aria-label')).toBe(
      '5 minutes 24 seconds per kilometer',
    )
  })

  it('keeps the date machine-readable', () => {
    const { container } = render(<FeedCard run={run} />)
    expect(container.querySelector('time')?.getAttribute('dateTime')).toBe(run.date)
  })

  it('hides the decorative avatar from assistive technology', () => {
    const { container } = render(<FeedCard run={run} />)
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('')
  })

  it('renders notes only when present', () => {
    const { rerender } = render(<FeedCard run={run} />)
    expect(screen.queryByText('Legs felt fresh.')).not.toBeNull()
    rerender(<FeedCard run={{ ...run, notes: undefined }} />)
    expect(screen.queryByText('Legs felt fresh.')).toBeNull()
  })

  it('shows fallbacks instead of NaN for bad numbers', () => {
    const { container } = render(<FeedCard run={{ ...run, distanceKm: NaN, durationSec: -1 }} />)
    const stats = container.querySelector('dl') as HTMLElement
    expect(stats.textContent).not.toMatch(/NaN|Infinity|Invalid/)
    expect(within(stats).getAllByText('—')).toHaveLength(3)
  })
})
