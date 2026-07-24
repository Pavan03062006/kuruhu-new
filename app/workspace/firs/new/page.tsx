import type { Metadata } from 'next'
import { FirCreationWizard } from '@/features/firs/components/fir-creation-wizard'

export const metadata: Metadata = { title: 'Create FIR' }

export default function NewFirPage() {
  return <FirCreationWizard />
}
