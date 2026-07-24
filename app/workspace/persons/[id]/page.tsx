import { PersonProfile } from '@/features/persons/components/person-profile'

export async function generateStaticParams() {
  return [{ id: '1' }]
}

export default async function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PersonProfile personId={id} />
}
