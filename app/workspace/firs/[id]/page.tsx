import { FirWorkspace } from '@/features/firs/components/fir-workspace'

export async function generateStaticParams() {
  const ids = [
    '1', '101', '102', '103', '104',
    'F-2401', 'F-2388', 'F-2367', 'F-2296', 'F-2244',
    'FIR-2026-0187', 'FIR-2026-0182', 'FIR-2026-0174', 'FIR-2026-0169', 'FIR-2026-0158',
    '0042-2026', '0039-2026', '0031-2026', '0018-2026',
  ]
  return ids.map(id => ({ id }))
}

export default async function FirDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <FirWorkspace firId={id} />
}
