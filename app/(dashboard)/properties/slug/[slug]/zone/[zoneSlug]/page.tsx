import { notFound } from 'next/navigation';
import { resolveProperty, resolveZone } from '../../../../../../../src/lib/slug-resolver';
import ZonePage from '../../../../[id]/zones/[zoneId]/page';

interface Props {
  params: Promise<{ slug: string; zoneSlug: string }>;
}

export default async function PropertySlugDirectZonePage({ params }: Props) {
  const { slug, zoneSlug } = await params;
  const property = await resolveProperty(slug);
  
  if (!property) {
    notFound();
  }
  
  const zone = await resolveZone(property.id, zoneSlug);
  
  if (!zone) {
    notFound();
  }
  
  // Reuse the existing zone page component with the resolved IDs
  return <ZonePage params={Promise.resolve({ id: property.id, zoneId: zone.id })} />;
}