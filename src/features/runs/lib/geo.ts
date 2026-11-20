const EARTH_RADIUS_KM = 6371

export interface Point {
  lat: number
  lng: number
}

export interface Fix extends Point {
  accuracy: number // metres
}

// Starting values, to be tuned against real GPS data from a test run.
export const MAX_ACCURACY_M = 30
export const MIN_HOP_M = 3

const toRad = (deg: number) => (deg * Math.PI) / 180

export function distanceKm(a: Point, b: Point): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2

  // min(1, ...) because rounding can push h past 1 for near-antipodal points, and asin would return NaN.
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

export function totalDistanceKm(fixes: readonly Fix[]): number {
  let total = 0
  let last: Fix | null = null
  for (const fix of fixes) {
    if (fix.accuracy > MAX_ACCURACY_M) continue
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
