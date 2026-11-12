export function formatDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`
}

export function formatPace(distanceKm: number, durationSec: number): string {
  const paceSec = Math.round(durationSec / distanceKm)
  const m = Math.floor(paceSec / 60)
  const s = String(paceSec % 60).padStart(2, '0')
  return `${m}:${s} /km`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}
