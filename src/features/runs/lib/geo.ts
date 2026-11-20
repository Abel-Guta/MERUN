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
