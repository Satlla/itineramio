import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Apartamento Turistico Malaga | Itineramio',
  description: 'Manual digital para vivienda turistica en Malaga. Normativa andaluza, mejores barrios, aeropuerto. Prueba gratis.',
  keywords: [
    'manual digital apartamento turistico malaga',
    'vivienda turistica malaga normativa',
    'VFT malaga registro',
    'alquiler vacacional malaga',
    'decreto 28/2016 malaga',
    'airbnb malaga regulacion',
    'costa del sol alquiler turistico',
    'manual huesped malaga',
  ],
  openGraph: {
    title: 'Manual Digital Apartamento Turistico Malaga | Itineramio',
    description: 'Manual digital para vivienda turistica en Malaga. Normativa andaluza, mejores barrios, aeropuerto. Prueba gratis.',
    url: 'https://www.itineramio.com/malaga',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio' }],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/malaga',
  },
}

export default function MalagaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
