import type { Metadata } from 'next'
import { Landing } from '@/features/landing'

export const metadata: Metadata = {
  description:
    'MERUN is a run log. Every run shows how far, how long and how fast, and where it happened.',
}

export default function HomePage() {
  return <Landing />
}
