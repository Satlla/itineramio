import { notFound, redirect } from 'next/navigation';
import { resolveProperty } from '../../../../../../src/lib/slug-resolver';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PropertySlugZonesPage({ params }: Props) {
  const { slug } = await params;
  const property = await resolveProperty(slug);
  
  if (!property) {
    notFound();
  }
  
  // Redirect to the ID-based route
  redirect(`/properties/${property.id}/zones`);
}