// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { TrackerStatus } from '../TrackerStatus'

afterEach(cleanup)

describe('TrackerStatus', () => {
  it.each([
    ['idle', 'Ready'],
    ['running', 'Running'],
    ['paused', 'Paused'],
    ['finished', 'Run finished'],
  ] as const)('says "%s" as "%s"', (status, text) => {
    render(<TrackerStatus status={status} />)
    expect(screen.getByRole('status').textContent).toBe(text)
  })

  it('is a live region, so a change is announced', () => {
    const { rerender } = render(<TrackerStatus status="running" />)
    const region = screen.getByRole('status')
    rerender(<TrackerStatus status="paused" />)
    expect(screen.getByRole('status')).toBe(region)
    expect(region.textContent).toBe('Paused')
  })

  it('hides the decorative mark from screen readers', () => {
    const { container } = render(<TrackerStatus status="running" />)
    expect(container.querySelector('.tracker-status__mark')?.getAttribute('aria-hidden')).toBe('true')
  })
})
