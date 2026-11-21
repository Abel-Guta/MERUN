import type { Fix } from './geo'

function isFiniteWithin(value: unknown, limit: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= limit
}

// Boundary: positions come from device hardware through the browser, so the
// declared types cannot be trusted (NaN coordinates and fake accuracy happen).
// Everything after this works with plain typed Fix values.
export function toFix(position: unknown): Fix | null {
  if (typeof position !== 'object' || position === null) return null
  const { coords } = position as { coords?: unknown }
  if (typeof coords !== 'object' || coords === null) return null

  const { latitude, longitude, accuracy } = coords as Record<string, unknown>
  if (!isFiniteWithin(latitude, 90) || !isFiniteWithin(longitude, 180)) return null
  if (!isFiniteWithin(accuracy, Infinity) || accuracy < 0) return null

  return { lat: latitude, lng: longitude, accuracy }
}
