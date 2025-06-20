import { notFound } from 'next/navigation';
import { resolveProperty } from '../../../../../../src/lib/slug-resolver';
import ZonesPage from '../../../[id]/zones/page';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PropertySlugZonesPage({ params }: Props) {
  const { slug } = await params;
  const property = await resolveProperty(slug);
  
  if (!property) {
    notFound();
  }
  
  // Reuse the existing zones page component with the resolved ID
  return <ZonesPage params={Promise.resolve({ id: property.id })} />;
}