// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { TrackerStats } from '../TrackerStats'

afterEach(cleanup)

describe('TrackerStats', () => {
  it('shows the time and the distance', () => {
    render(<TrackerStats durationSec={65} distanceKm={1.5} />)
    expect(screen.getByText('Time').nextElementSibling?.textContent).toBe('1:05')
    expect(screen.getByText('Distance').nextElementSibling?.textContent).toBe('1.5 km')
  })

  it('speaks the distance in full words', () => {
    render(<TrackerStats durationSec={65} distanceKm={1.5} />)
    expect(screen.getByLabelText('1.5 kilometers')).toBeTruthy()
  })

  it('lights one tick per whole kilometre', () => {
    const { container } = render(<TrackerStats durationSec={65} distanceKm={2.6} />)
    expect(container.querySelectorAll('.tracker-stats__tick')).toHaveLength(10)
    expect(container.querySelectorAll('.tracker-stats__tick--on')).toHaveLength(2)
  })

  it('leaves the time without a spoken label', () => {
    render(<TrackerStats durationSec={65} distanceKm={1.5} />)
    expect(screen.getByText('1:05').hasAttribute('aria-label')).toBe(false)
  })
})
