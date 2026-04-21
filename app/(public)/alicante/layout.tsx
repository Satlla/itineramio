import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Apartamento Turistico Alicante | Itineramio',
  description: 'Manual digital para vivienda turistica en Alicante. Normativa, playas, parking. Prueba gratis 15 dias.',
  keywords: [
    'manual digital apartamento turistico alicante',
    'vivienda turistica alicante normativa',
    'alquiler vacacional alicante',
    'gestion apartamento turistico alicante',
    'ley 15/2018 vivienda turistica',
    'decreto 10/2021 alicante',
    'airbnb alicante regulacion',
    'manual huesped alicante',
  ],
  openGraph: {
    title: 'Manual Digital Apartamento Turistico Alicante | Itineramio',
    description: 'Manual digital para vivienda turistica en Alicante. Normativa, playas, parking. Prueba gratis 15 dias.',
    url: 'https://www.itineramio.com/alicante',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio' }],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/alicante',
  },
}

export default function AlicanteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
