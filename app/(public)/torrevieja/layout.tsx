import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Apartamento Turistico Torrevieja | Itineramio',
  description: 'Crea tu manual digital para huespedes en Torrevieja. Normativa Comunitat Valenciana y gestion turistica Costa Blanca Sur.',
  keywords: ['manual digital apartamento turistico torrevieja', 'vivienda turistica torrevieja', 'alquiler vacacional torrevieja', 'normativa VUT torrevieja', 'airbnb torrevieja', 'costa blanca sur alquiler', 'gestion huesped torrevieja', 'manual huesped torrevieja'],
  openGraph: {
    title: 'Manual Digital Apartamento Turistico Torrevieja | Itineramio',
    description: 'Crea tu manual digital para huespedes en Torrevieja. Normativa Comunitat Valenciana y gestion turistica Costa Blanca Sur.',
    url: 'https://www.itineramio.com/torrevieja',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio' }],
  },
  alternates: { canonical: 'https://www.itineramio.com/torrevieja' },
  twitter: { card: 'summary_large_image', images: ['/og-image.jpg'] },
}

export default function TorreviejaLayout({ children }: { children: React.ReactNode }) {
  return <>{}</>
}
