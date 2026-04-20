import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Apartamento Turistico Benidorm | Itineramio',
  description: 'Crea tu manual digital para huespedes en Benidorm. Normativa, zonas y gestion de vivienda turistica en la Costa Blanca.',
  keywords: ['manual digital apartamento turistico benidorm', 'vivienda turistica benidorm', 'alquiler vacacional benidorm', 'licencia alquiler vacacional benidorm', 'airbnb benidorm', 'rincon de loix alquiler', 'gestion huesped benidorm', 'manual huesped benidorm'],
  openGraph: {
    title: 'Manual Digital Apartamento Turistico Benidorm | Itineramio',
    description: 'Crea tu manual digital para huespedes en Benidorm. Normativa, zonas y gestion de vivienda turistica en la Costa Blanca.',
    url: 'https://www.itineramio.com/benidorm',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio' }],
  },
  alternates: { canonical: 'https://www.itineramio.com/benidorm' },
  twitter: { card: 'summary_large_image', images: ['/og-image.jpg'] },
}

export default function BenidormLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
