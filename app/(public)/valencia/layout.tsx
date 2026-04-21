import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Vivienda Turistica Valencia | Itineramio',
  description: 'Manual digital para vivienda turistica en Valencia. Compatibilidad urbanistica, limite 10 dias, normativa 2026. Prueba gratis.',
  keywords: [
    'manual digital vivienda turistica valencia',
    'alquiler vacacional valencia normativa',
    'VT valencia registro',
    'compatibilidad urbanistica valencia',
    'airbnb valencia regulacion',
    'tasa turistica valencia',
    'gestion apartamento turistico valencia',
    'manual huesped valencia',
  ],
  openGraph: {
    title: 'Manual Digital Vivienda Turistica Valencia | Itineramio',
    description: 'Manual digital para vivienda turistica en Valencia. Compatibilidad urbanistica, limite 10 dias, normativa 2026. Prueba gratis.',
    url: 'https://www.itineramio.com/valencia',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio' }],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/valencia',
  },
}

export default function ValenciaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
