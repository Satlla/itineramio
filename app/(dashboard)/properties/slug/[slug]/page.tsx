import { notFound } from 'next/navigation';
import { resolveProperty } from '../../../../../src/lib/slug-resolver';
import PropertyPage from '../../[id]/page';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PropertySlugPage({ params }: Props) {
  const { slug } = await params;
  const property = await resolveProperty(slug);
  
  if (!property) {
    notFound();
  }
  
  // Reuse the existing property page component with the resolved ID
  return <PropertyPage params={Promise.resolve({ id: property.id })} />;
}