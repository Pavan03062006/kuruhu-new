import { FirWorkspace } from '@/features/firs/components/fir-workspace'

export async function generateStaticParams() {
  return [{ id: '1' }]
}

export default async function FirDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <FirWorkspace firId={id} />
}
