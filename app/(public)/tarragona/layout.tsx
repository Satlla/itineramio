import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Apartamento Turistico Tarragona | Itineramio',
  description: 'Manual digital para vivienda turistica en Tarragona. Normativa catalana NIRTC, patrimonio romano, playas y tasa turistica. Prueba gratis 15 dias.',
  keywords: [
    'manual digital apartamento turistico tarragona',
    'vivienda turistica tarragona normativa',
    'alquiler vacacional tarragona',
    'gestion apartamento turistico cataluna',
    'NIRTC tarragona registro turistico',
    'airbnb tarragona regulacion',
    'manual huesped tarragona',
    'tasa turistica tarragona',
  ],
  openGraph: {
    title: 'Manual Digital Apartamento Turistico Tarragona | Itineramio',
    description: 'Manual digital para vivienda turistica en Tarragona. Normativa catalana NIRTC, patrimonio romano, playas y tasa turistica. Prueba gratis 15 dias.',
    url: 'https://www.itineramio.com/tarragona',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.itineramio.com/tarragona',
  },
}

export default function TarragonaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
