/** Formatting helpers for run data. Contract: docs/ARCHITECTURE.md. */

export const FALLBACK = '—'
export const FALLBACK_LABEL = 'not available'

// toFixed switches to exponential notation at 1e21, hence the upper bounds.
const MAX_DURATION_SEC = 365 * 24 * 60 * 60
const MAX_DISTANCE_KM = 100_000
const MAX_PACE_SEC_PER_KM = 99 * 60 + 59

function isNumberInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
}

function toSeconds(value: unknown): number | null {
  return isNumberInRange(value, 0, MAX_DURATION_SEC) ? Math.round(value) : null
}

function toKm(value: unknown): number | null {
  return isNumberInRange(value, 0, MAX_DISTANCE_KM) ? value : null
}

function toPaceSec(distanceKm: unknown, durationSec: unknown): number | null {
  const km = toKm(distanceKm)
  const sec = toSeconds(durationSec)
  if (km === null || sec === null || km === 0 || sec === 0) return null
  const pace = Math.round(sec / km)
  return pace >= 1 && pace <= MAX_PACE_SEC_PER_KM ? pace : null
}

function toDate(value: unknown): Date | null {
  if (typeof value !== 'string' || value.trim() === '') return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function splitDuration(totalSec: number) {
  return {
    hours: Math.floor(totalSec / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  }
}

function plural(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? '' : 's'}`
}

export function formatDuration(totalSec: unknown): string {
  const total = toSeconds(totalSec)
  if (total === null) return FALLBACK
  const { hours, minutes, seconds } = splitDuration(total)
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${minutes}:${ss}`
}

export function formatDistance(distanceKm: unknown): string {
  const km = toKm(distanceKm)
  return km === null ? FALLBACK : `${km.toFixed(1)} km`
}

export function formatPace(distanceKm: unknown, durationSec: unknown): string {
  const pace = toPaceSec(distanceKm, durationSec)
  if (pace === null) return FALLBACK
  const minutes = Math.floor(pace / 60)
  const seconds = String(pace % 60).padStart(2, '0')
  return `${minutes}:${seconds} /km`
}

export function formatDate(iso: unknown): string {
  const date = toDate(iso)
  if (date === null) return FALLBACK
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function durationLabel(totalSec: unknown): string {
  const total = toSeconds(totalSec)
  if (total === null) return FALLBACK_LABEL
  const { hours, minutes, seconds } = splitDuration(total)
  const parts = [
    hours > 0 ? plural(hours, 'hour') : null,
    minutes > 0 ? plural(minutes, 'minute') : null,
    seconds > 0 ? plural(seconds, 'second') : null,
  ].filter((part): part is string => part !== null)
  return parts.length > 0 ? parts.join(' ') : '0 seconds'
}

export function distanceLabel(distanceKm: unknown): string {
  const km = toKm(distanceKm)
  return km === null ? FALLBACK_LABEL : `${km.toFixed(1)} kilometers`
}

export function paceLabel(distanceKm: unknown, durationSec: unknown): string {
  const pace = toPaceSec(distanceKm, durationSec)
  if (pace === null) return FALLBACK_LABEL
  return `${plural(Math.floor(pace / 60), 'minute')} ${plural(pace % 60, 'second')} per kilometer`
}

export function formatDateLong(iso: unknown): string {
  const date = toDate(iso)
  if (date === null) return FALLBACK_LABEL
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
