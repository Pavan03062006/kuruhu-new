import { PersonProfile } from '@/features/persons/components/person-profile'

export async function generateStaticParams() {
  const ids = [
    '1', '1001', '1002', '1003', '1004', '1005', '1006', '1007', '1008',
    'P-1001', 'P-1002', 'P-1003', 'P-1004', 'P-1005', 'P-1006', 'P-1007', 'P-1008',
  ]
  return ids.map(id => ({ id }))
}

export default async function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PersonProfile personId={id} />
}
