'use client'

import { useId } from 'react'
import { useRuns } from '../hooks/use-runs'
import { FeedCard } from './FeedCard'
import './Feed.css'

const SKELETON_COUNT = 3

export function Feed() {
  const headingId = useId()
  const { items, status, hasMore, loadingMore, moreFailed, retry, loadMore } = useRuns()

  return (
    <section
      className="feed"
      aria-labelledby={headingId}
      aria-busy={status === 'loading' || loadingMore}
    >
      <h2 id={headingId} className="feed__heading">
        Recent runs
      </h2>

      {status === 'loading' && (
        <>
          <output className="visually-hidden">Loading runs</output>
          <ul className="feed__list" aria-hidden="true">
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <li key={index} className="feed__skeleton" />
            ))}
          </ul>
        </>
      )}

      {status === 'error' && (
        <div className="feed__message" role="alert">
          <p>Could not load runs.</p>
          <button type="button" className="feed__button" onClick={retry}>
            Try again
          </button>
        </div>
      )}

      {status === 'ready' && items.length === 0 && (
        <output className="feed__empty">No runs yet.</output>
      )}

      {status === 'ready' && items.length > 0 && (
        <>
          <output className="visually-hidden">Showing {items.length} runs</output>
          <ul className="feed__list">
            {items.map((run) => (
              <li key={run.id}>
                <FeedCard run={run} />
              </li>
            ))}
          </ul>

          {moreFailed && (
            <p className="feed__message" role="alert">
              Could not load more runs.
            </p>
          )}

          {hasMore && (
            <button
              type="button"
              className="feed__button feed__more"
              // aria-disabled instead of disabled so keyboard focus stays on
              // the button while it loads.
              aria-disabled={loadingMore}
              onClick={() => {
                if (!loadingMore) void loadMore()
              }}
            >
              {loadingMore ? 'Loading more runs' : moreFailed ? 'Try again' : 'Load more runs'}
            </button>
          )}
        </>
      )}
    </section>
  )
}
