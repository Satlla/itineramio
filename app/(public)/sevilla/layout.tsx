import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Apartamento Turistico Sevilla | Itineramio',
  description: 'Manual digital para alquiler turistico en Sevilla. Gestiona check-in, AC y Feria de Abril. Prueba gratis 15 dias.',
  keywords: [
    'manual digital apartamento turistico sevilla',
    'vivienda turistica sevilla normativa',
    'alquiler vacacional sevilla',
    'VFT sevilla registro',
    'decreto 28/2016 andalucia',
    'airbnb sevilla regulacion',
    'gestion huesped sevilla',
    'manual huesped sevilla',
  ],
  openGraph: {
    title: 'Manual Digital Apartamento Turistico Sevilla | Itineramio',
    description: 'Manual digital para alquiler turistico en Sevilla. Gestiona check-in, AC y Feria de Abril. Prueba gratis 15 dias.',
    url: 'https://www.itineramio.com/sevilla',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.itineramio.com/sevilla',
  },
}

export default function SevillaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
