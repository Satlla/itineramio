import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Apartamento Turistico Santander | Itineramio',
  description: 'Crea tu manual digital para huespedes en Santander. Normativa Cantabria, playas y gestion turistica.',
  keywords: ['manual digital apartamento turistico santander', 'vivienda turistica santander', 'normativa turismo cantabria', 'alquiler vacacional santander', 'airbnb santander', 'sardinero alquiler', 'gestion huesped santander', 'manual huesped santander'],
  openGraph: {
    title: 'Manual Digital Apartamento Turistico Santander | Itineramio',
    description: 'Crea tu manual digital para huespedes en Santander. Normativa Cantabria, playas y gestion turistica.',
    url: 'https://www.itineramio.com/santander',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio' }],
  },
  alternates: { canonical: 'https://www.itineramio.com/santander' },
  twitter: { card: 'summary_large_image', images: ['/og-image.jpg'] },
}

export default function SantanderLayout({ children }: { children: React.ReactNode }) {
  return <>{}</>
}
