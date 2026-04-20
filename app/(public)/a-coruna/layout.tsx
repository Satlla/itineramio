import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Apartamento Turistico A Coruna | Itineramio',
  description: 'Crea tu manual digital para huespedes en A Coruna. Normativa Galicia, playas y gestion turistica.',
  keywords: ['manual digital apartamento turistico a coruna', 'vivienda turistica a coruna', 'normativa turismo galicia', 'alquiler vacacional a coruna', 'airbnb a coruna', 'riazor alquiler', 'gestion huesped a coruna', 'manual huesped a coruna'],
  openGraph: {
    title: 'Manual Digital Apartamento Turistico A Coruna | Itineramio',
    description: 'Crea tu manual digital para huespedes en A Coruna. Normativa Galicia, playas y gestion turistica.',
    url: 'https://www.itineramio.com/a-coruna',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio' }],
  },
  alternates: { canonical: 'https://www.itineramio.com/a-coruna' },
  twitter: { card: 'summary_large_image', images: ['/og-image.jpg'] },
}

export default function ACorunaLayout({ children }: { children: React.ReactNode }) {
  return <>{}</>
}
