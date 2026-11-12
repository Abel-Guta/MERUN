import { Feed } from './components/Feed'
import runsData from './data/runs.json'
import type { Run } from './types/run'

const runs = runsData as Run[]

function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <header className="app__header">
        <h1 className="app__title">MERUN</h1>
      </header>
      <main id="main" className="app" tabIndex={-1}>
        <Feed runs={runs} />
      </main>
    </>
  )
}

export default App
