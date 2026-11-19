// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Landing } from '../Landing'

afterEach(cleanup)

describe('Landing', () => {
  it('has exactly one h1, the headline', () => {
    render(<Landing />)
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0].textContent).toBe('Every run, on the record.')
  })

  it('names each section with an h2', () => {
    render(<Landing />)
    const names = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(names).toEqual([
      'One run, read at a glance.',
      'Built to be read aloud.',
      'Start with the feed.',
    ])
    expect(screen.getAllByRole('region')).toHaveLength(4)
  })

  it('links every call to action to the feed', () => {
    render(<Landing />)
    const links = screen.getAllByRole('link', { name: 'See the feed' })
    expect(links).toHaveLength(2)
    for (const link of links) expect(link.getAttribute('href')).toBe('/feed')
  })

  it('hides the decorative artwork from assistive technology', () => {
    const { container } = render(<Landing />)
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('says the example run is not live data', () => {
    render(<Landing />)
    expect(screen.queryByText('An example run, not live data.')).not.toBeNull()
  })

  it('gives the spoken form of each stat', () => {
    render(<Landing />)
    expect(screen.queryByText('5 minutes 24 seconds per kilometer')).not.toBeNull()
    expect(screen.queryByText('28 minutes 5 seconds')).not.toBeNull()
    expect(screen.queryByText('5.2 kilometers')).not.toBeNull()
  })
})
