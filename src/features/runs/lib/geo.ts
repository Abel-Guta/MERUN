const EARTH_RADIUS_KM = 6371

export interface Point {
  lat: number
  lng: number
}

function isCoordinate(value: unknown, limit: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= limit
}

export function toPoint(value: unknown): Point | null {
  if (typeof value !== 'object' || value === null) return null
  const { lat, lng } = value as Record<string, unknown>
  if (!isCoordinate(lat, 90) || !isCoordinate(lng, 180)) return null
  return { lat, lng }
}

const toRad = (deg: number) => (deg * Math.PI) / 180

// Returns 0 for bad input so one bad GPS reading cannot corrupt a running total.
export function distanceKm(a: unknown, b: unknown): number {
  const p = toPoint(a)
  const q = toPoint(b)
  if (!p || !q) return 0

  const dLat = toRad(q.lat - p.lat)
  const dLng = toRad(q.lng - p.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p.lat)) * Math.cos(toRad(q.lat)) * Math.sin(dLng / 2) ** 2

  // min(1, ...) because rounding can push h past 1 for near-antipodal points, and asin would return NaN.
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

// Starting values, to be tuned against real GPS data from a test run.
export const MAX_ACCURACY_M = 30
export const MIN_HOP_M = 3

export interface Fix extends Point {
  accuracy: number // metres
}

function toFix(value: unknown): Fix | null {
  const point = toPoint(value)
  if (!point) return null
  const { accuracy } = value as Record<string, unknown>
  if (typeof accuracy !== 'number' || !Number.isFinite(accuracy) || accuracy < 0) return null
  return { ...point, accuracy }
}

export function totalDistanceKm(fixes: unknown): number {
  if (!Array.isArray(fixes)) return 0

  let total = 0
  let last: Fix | null = null
  for (const item of fixes) {
    const fix = toFix(item)
    if (!fix || fix.accuracy > MAX_ACCURACY_M) continue
    if (!last) {
      last = fix
      continue
    }
    const hop = distanceKm(last, fix)
    // Compared with the last accepted fix, not the previous raw one, so a
    // stationary wobble never accumulates but slow real movement still does.
    if (hop * 1000 < Math.max(MIN_HOP_M, fix.accuracy)) continue
    total += hop
    last = fix
  }
  return total
}
