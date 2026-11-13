import { Feed } from '../components/Feed'
import runsData from '../data/runs.json'
import type { Run } from '../types/run'

const runs = runsData as Run[]

export default function HomePage() {
  return <Feed runs={runs} />
}
