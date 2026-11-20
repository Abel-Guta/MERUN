import { toPoint, type Fix } from './geo'

// Boundary: positions come from device hardware through the browser, so the
// declared types cannot be trusted (NaN coordinates and fake accuracy happen).
export function toFix(position: unknown): Fix | null {
  if (typeof position !== 'object' || position === null) return null
  const { coords } = position as { coords?: unknown }
  if (typeof coords !== 'object' || coords === null) return null

  const { latitude, longitude, accuracy } = coords as Record<string, unknown>
  const point = toPoint({ lat: latitude, lng: longitude })
  if (!point) return null
  if (typeof accuracy !== 'number' || !Number.isFinite(accuracy) || accuracy < 0) return null

  return { ...point, accuracy }
}
