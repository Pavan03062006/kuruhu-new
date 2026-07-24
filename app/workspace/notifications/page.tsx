import type { Metadata } from 'next'
import { NotificationsCentre } from '@/features/activity/components/notifications-centre'

export const metadata: Metadata = { title: 'Notifications' }

export default function NotificationsPage() {
  return <NotificationsCentre />
}
