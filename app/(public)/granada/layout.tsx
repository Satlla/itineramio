import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Apartamento Turistico Granada | Itineramio',
  description: 'Manual digital para alquiler turistico en Granada. Albaicin, Alhambra, normativa. Prueba gratis 15 dias.',
  keywords: [
    'manual digital apartamento turistico granada',
    'vivienda turistica granada normativa',
    'alquiler vacacional granada',
    'decreto 28/2016 andalucia turismo',
    'airbnb granada albaicin',
    'alhambra apartamento turistico',
    'registro turismo andalucia',
    'manual huesped granada',
  ],
  openGraph: {
    title: 'Manual Digital Apartamento Turistico Granada | Itineramio',
    description: 'Manual digital para alquiler turistico en Granada. Albaicin, Alhambra, normativa. Prueba gratis 15 dias.',
    url: 'https://www.itineramio.com/granada',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio' }],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/granada',
  },
}

export default function GranadaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
