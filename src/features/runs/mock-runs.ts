import seed from './seed.json'
import type { Run } from './types'

// A type assertion, not a runtime check. Fine for our own seed; real data must
// go through a validator.
export const mockRuns = seed as Run[]
