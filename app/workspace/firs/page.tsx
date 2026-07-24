import type { Metadata } from 'next'
import { FirDirectory } from '@/features/firs/components/fir-directory'

export const metadata: Metadata = { title: 'FIRs' }

export default function FirsPage() {
  return <FirDirectory />
}
