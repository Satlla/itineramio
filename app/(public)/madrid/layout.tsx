import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Apartamento Turistico Madrid | Itineramio',
  description: 'Crea tu manual digital para huespedes en Madrid. Normativa, requisitos y gestion de vivienda turistica. Prueba gratis 15 dias.',
  keywords: [
    'manual digital apartamento turistico madrid',
    'vivienda turistica madrid normativa',
    'alquiler vacacional madrid',
    'gestion apartamento turistico madrid',
    'VUT madrid registro',
    'decreto 79/2014 madrid',
    'airbnb madrid regulacion',
    'manual huesped madrid',
  ],
  openGraph: {
    title: 'Manual Digital Apartamento Turistico Madrid | Itineramio',
    description: 'Crea tu manual digital para huespedes en Madrid. Normativa, requisitos y gestion de vivienda turistica. Prueba gratis 15 dias.',
    url: 'https://www.itineramio.com/madrid',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio' }],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/madrid',
  },
}

export default function MadridLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
