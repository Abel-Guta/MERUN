import { describe, expect, it } from 'vitest'
import {
  elapsedSec,
  initialTracker,
  trackerReducer,
  type TrackerEvent,
  type TrackerState,
} from '../tracker'

function run(events: TrackerEvent[], from: TrackerState = initialTracker): TrackerState {
  return events.reduce(trackerReducer, from)
}

const running: TrackerState = { status: 'running', startedAt: 0, resumedAt: 0, elapsedMs: 0 }
const paused: TrackerState = { status: 'paused', startedAt: 0, elapsedMs: 10_000 }
const finished: TrackerState = { status: 'finished', startedAt: 0, elapsedMs: 15_000 }

describe('trackerReducer', () => {
  it('starts from idle', () => {
    expect(run([{ type: 'start', at: 1000 }])).toEqual({
      status: 'running',
      startedAt: 1000,
      resumedAt: 1000,
      elapsedMs: 0,
    })
  })

  it('banks elapsed time on pause and stop', () => {
    expect(trackerReducer(running, { type: 'pause', at: 10_000 })).toEqual(paused)
    expect(trackerReducer(running, { type: 'stop', at: 35_000 })).toEqual({
      status: 'finished',
      startedAt: 0,
      elapsedMs: 35_000,
    })
  })

  it('does not count paused time', () => {
    const state = run([
      { type: 'start', at: 0 },
      { type: 'pause', at: 10_000 },
      { type: 'resume', at: 30_000 },
      { type: 'stop', at: 35_000 },
    ])
    expect(state).toEqual(finished)
  })

  it('finishes straight from paused', () => {
    expect(trackerReducer(paused, { type: 'stop', at: 99_000 })).toEqual({
      status: 'finished',
      startedAt: 0,
      elapsedMs: 10_000,
    })
  })

  it('keeps startedAt across pause and resume', () => {
    const state = run([
      { type: 'start', at: 500 },
      { type: 'pause', at: 1500 },
      { type: 'resume', at: 2500 },
    ])
    expect(state).toMatchObject({ status: 'running', startedAt: 500, elapsedMs: 1000 })
  })

  it.each<[string, TrackerState, TrackerEvent]>([
    ['pause while idle', initialTracker, { type: 'pause', at: 1 }],
    ['resume while idle', initialTracker, { type: 'resume', at: 1 }],
    ['stop while idle', initialTracker, { type: 'stop', at: 1 }],
    ['start while running', running, { type: 'start', at: 1 }],
    ['resume while running', running, { type: 'resume', at: 1 }],
    ['start while paused', paused, { type: 'start', at: 1 }],
    ['pause while paused', paused, { type: 'pause', at: 1 }],
    ['start while finished', finished, { type: 'start', at: 1 }],
    ['pause while finished', finished, { type: 'pause', at: 1 }],
    ['stop while finished', finished, { type: 'stop', at: 1 }],
  ])('ignores %s', (_name, state, event) => {
    expect(trackerReducer(state, event)).toBe(state)
  })

  it.each([initialTracker, running, paused, finished])('resets from %o', (state) => {
    expect(trackerReducer(state, { type: 'reset' })).toBe(initialTracker)
  })
})

describe('elapsedSec', () => {
  it('is 0 while idle', () => {
    expect(elapsedSec(initialTracker, 50_000)).toBe(0)
  })

  it('counts the current stretch while running', () => {
    expect(elapsedSec({ ...running, elapsedMs: 10_000, resumedAt: 30_000 }, 35_000)).toBe(15)
  })

  it('is frozen while paused and after finishing', () => {
    expect(elapsedSec(paused, 999_000)).toBe(10)
    expect(elapsedSec(finished, 999_000)).toBe(15)
  })

  it('counts nothing for a clock that went backwards', () => {
    expect(trackerReducer({ ...running, resumedAt: 50_000 }, { type: 'stop', at: 20_000 })).toEqual({
      status: 'finished',
      startedAt: 0,
      elapsedMs: 0,
    })
    expect(elapsedSec({ ...running, resumedAt: 50_000 }, 20_000)).toBe(0)
  })

  it('floors to whole seconds', () => {
    expect(elapsedSec(running, 9999)).toBe(9)
    expect(elapsedSec({ ...finished, elapsedMs: 9999 }, 0)).toBe(9)
  })
})
