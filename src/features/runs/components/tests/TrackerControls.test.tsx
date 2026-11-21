// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TrackerControls } from '../TrackerControls'

afterEach(cleanup)

function setup(status: 'idle' | 'running' | 'paused' | 'finished') {
  const handlers = { onStart: vi.fn(), onPause: vi.fn(), onResume: vi.fn(), onStop: vi.fn() }
  const view = render(<TrackerControls status={status} {...handlers} />)
  return { ...view, handlers }
}

const names = () => screen.queryAllByRole('button').map((button) => button.textContent)

describe('TrackerControls', () => {
  it('offers only Start while idle', () => {
    const { handlers } = setup('idle')
    expect(names()).toEqual(['Start'])
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(handlers.onStart).toHaveBeenCalledTimes(1)
  })

  it('offers Pause and Stop while running', () => {
    const { handlers } = setup('running')
    expect(names()).toEqual(['Pause', 'Stop'])
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
    expect(handlers.onPause).toHaveBeenCalledTimes(1)
    expect(handlers.onStop).toHaveBeenCalledTimes(1)
  })

  it('offers Resume and Stop while paused', () => {
    const { handlers } = setup('paused')
    expect(names()).toEqual(['Resume', 'Stop'])
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }))
    expect(handlers.onResume).toHaveBeenCalledTimes(1)
  })

  it('shows no buttons once finished', () => {
    setup('finished')
    expect(names()).toEqual([])
  })

  it('keeps keyboard focus when Pause becomes Resume', () => {
    const noop = vi.fn()
    const props = { onStart: noop, onPause: noop, onResume: noop, onStop: noop }
    const { rerender } = render(<TrackerControls status="running" {...props} />)
    const button = screen.getByRole('button', { name: 'Pause' })
    button.focus()
    rerender(<TrackerControls status="paused" {...props} />)
    expect(screen.getByRole('button', { name: 'Resume' })).toBe(button)
    expect(document.activeElement).toBe(button)
  })
})
