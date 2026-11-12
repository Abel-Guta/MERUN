import { Feed } from './components/Feed'
import runsData from './data/runs.json'
import type { Run } from './types/run'

const runs = runsData as Run[]

function App() {
  return (
    <main className="app">
      <h1 className="app__title">MERUN</h1>
      <Feed runs={runs} />
    </main>
  )
}

export default App
