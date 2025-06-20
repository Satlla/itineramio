import { notFound, redirect } from 'next/navigation';
import { resolveProperty, resolveZone } from '../../../../../../../src/lib/slug-resolver';

interface Props {
  params: Promise<{ slug: string; zoneSlug: string }>;
}

export default async function PropertySlugZoneSlugPage({ params }: Props) {
  const { slug, zoneSlug } = await params;
  const property = await resolveProperty(slug);
  
  if (!property) {
    notFound();
  }
  
  const zone = await resolveZone(property.id, zoneSlug);
  
  if (!zone) {
    notFound();
  }
  
  // Redirect to the ID-based route
  redirect(`/properties/${property.id}/zones/${zone.id}`);
}