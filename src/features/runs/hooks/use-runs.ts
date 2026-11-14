'use client'

import { useCallback, useEffect, useState } from 'react'
import { fetchRuns } from '../lib/api'
import type { Run } from '../types'

const PAGE_SIZE = 10

export function useRuns() {
  const [items, setItems] = useState<Run[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [moreFailed, setMoreFailed] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetchRuns({ limit: PAGE_SIZE, signal: controller.signal })
      .then((page) => {
        setItems(page.items)
        setNextCursor(page.nextCursor)
        setStatus('ready')
      })
      .catch(() => {
        // An aborted request means the component unmounted or retried; the
        // newer request owns the state.
        if (!controller.signal.aborted) setStatus('error')
      })
    return () => controller.abort()
  }, [attempt])

  const retry = useCallback(() => {
    setStatus('loading')
    setAttempt((n) => n + 1)
  }, [])

  const loadMore = useCallback(async () => {
    if (nextCursor === null || loadingMore) return
    setLoadingMore(true)
    setMoreFailed(false)
    try {
      const page = await fetchRuns({ limit: PAGE_SIZE, cursor: nextCursor })
      setItems((current) => {
        const seen = new Set(current.map((run) => run.id))
        return [...current, ...page.items.filter((run) => !seen.has(run.id))]
      })
      setNextCursor(page.nextCursor)
    } catch {
      setMoreFailed(true)
    } finally {
      setLoadingMore(false)
    }
  }, [nextCursor, loadingMore])

  return {
    items,
    status,
    hasMore: nextCursor !== null,
    loadingMore,
    moreFailed,
    retry,
    loadMore,
  }
}