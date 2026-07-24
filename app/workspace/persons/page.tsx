import type { Metadata } from 'next'
import { PersonDirectory } from '@/features/persons/components/person-directory'

export const metadata: Metadata = { title: 'Persons' }

export default function PersonsPage() {
  return <PersonDirectory />
}
