import type { Metadata } from 'next'
import { ActivityTrail } from '@/features/activity/components/activity-trail'

export const metadata: Metadata = { title: 'Activity' }

export default function ActivityPage() {
  return <ActivityTrail />
}
