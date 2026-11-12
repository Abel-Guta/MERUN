export interface User {
  id: string
  name: string
  username: string
  avatarUrl: string
}

export interface Run {
  id: string
  user: User
  title: string
  distanceKm: number
  durationSec: number
  date: string // ISO 8601
  location: string
  notes?: string
}
