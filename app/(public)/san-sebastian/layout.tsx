import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Apartamento Turistico San Sebastian | Itineramio',
  description: 'Crea tu manual digital para huespedes en San Sebastian. Normativa Pais Vasco, gastronomia y gestion turistica.',
  keywords: ['manual digital apartamento turistico san sebastian', 'vivienda turistica san sebastian', 'alquiler vacacional donostia', 'normativa turismo pais vasco', 'airbnb san sebastian', 'pintxos san sebastian', 'gestion huesped donostia', 'manual huesped san sebastian'],
  openGraph: {
    title: 'Manual Digital Apartamento Turistico San Sebastian | Itineramio',
    description: 'Crea tu manual digital para huespedes en San Sebastian. Normativa Pais Vasco, gastronomia y gestion turistica.',
    url: 'https://www.itineramio.com/san-sebastian',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio' }],
  },
  alternates: { canonical: 'https://www.itineramio.com/san-sebastian' },
  twitter: { card: 'summary_large_image', images: ['/og-image.jpg'] },
}

export default function SanSebastianLayout({ children }: { children: React.ReactNode }) {
  return <>{}</>
}
