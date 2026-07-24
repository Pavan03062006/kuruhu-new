import { FirWorkspace } from '@/features/firs/components/fir-workspace'

export default async function FirDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <FirWorkspace firId={id} />
}
