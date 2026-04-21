import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Alquiler Turistico Palma | Itineramio',
  description: 'Manual digital para vivienda turistica en Palma de Mallorca. Moratoria, ITS, convivencia. Prueba gratis.',
  keywords: [
    'manual digital alquiler turistico palma',
    'vivienda turistica palma de mallorca',
    'alquiler vacacional mallorca normativa',
    'ITS impuesto estancias turisticas baleares',
    'moratoria turistica palma mallorca',
    'airbnb palma regulacion',
    'ley 6/2017 baleares turismo',
    'manual huesped palma',
  ],
  openGraph: {
    title: 'Manual Digital Alquiler Turistico Palma | Itineramio',
    description: 'Manual digital para vivienda turistica en Palma de Mallorca. Moratoria, ITS, convivencia. Prueba gratis.',
    url: 'https://www.itineramio.com/palma-de-mallorca',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio' }],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/palma-de-mallorca',
  },
}

export default function PalmaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
