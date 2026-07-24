import type { Metadata } from 'next'
import { EvidenceGraph } from '@/features/graph/components/evidence-graph'

export const metadata: Metadata = { title: 'Evidence Graph' }

export default function GraphPage() {
  return <EvidenceGraph />
}
