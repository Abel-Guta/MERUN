export type TrackerState =
  | { status: 'idle' }
  | { status: 'running'; startedAt: number; resumedAt: number; elapsedMs: number }
  | { status: 'paused'; startedAt: number; elapsedMs: number }
  | { status: 'finished'; startedAt: number; elapsedMs: number }

export type TrackerEvent =
  | { type: 'start'; at: number }
  | { type: 'pause'; at: number }
  | { type: 'resume'; at: number }
  | { type: 'stop'; at: number }
  | { type: 'reset' }

export const initialTracker: TrackerState = { status: 'idle' }

// The device clock can be moved back mid-run; a negative span would fail the API's duration check.
function span(from: number, to: number): number {
  return to > from ? to - from : 0
}

// The caller supplies the time (`at`) so the reducer stays pure and tests need no fake clock.
export function trackerReducer(state: TrackerState, event: TrackerEvent): TrackerState {
  if (event.type === 'reset') return initialTracker

  switch (state.status) {
    case 'idle':
      if (event.type === 'start') {
        return { status: 'running', startedAt: event.at, resumedAt: event.at, elapsedMs: 0 }
      }
      return state
    case 'running': {
      const elapsedMs = state.elapsedMs + span(state.resumedAt, event.at)
      if (event.type === 'pause') return { status: 'paused', startedAt: state.startedAt, elapsedMs }
      if (event.type === 'stop') return { status: 'finished', startedAt: state.startedAt, elapsedMs }
      return state
    }
    case 'paused':
      if (event.type === 'resume') {
        return {
          status: 'running',
          startedAt: state.startedAt,
          resumedAt: event.at,
          elapsedMs: state.elapsedMs,
        }
      }
      if (event.type === 'stop') {
        return { status: 'finished', startedAt: state.startedAt, elapsedMs: state.elapsedMs }
      }
      return state
    case 'finished':
      return state
  }
}

export function elapsedSec(state: TrackerState, now: number): number {
  switch (state.status) {
    case 'idle':
      return 0
    case 'running':
      return Math.floor((state.elapsedMs + span(state.resumedAt, now)) / 1000)
    case 'paused':
    case 'finished':
      return Math.floor(state.elapsedMs / 1000)
  }
}
