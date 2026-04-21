import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Vivienda Vacacional Las Palmas | Itineramio',
  description: 'Manual digital para vivienda vacacional en Las Palmas. Ley 6/2025, declaracion responsable. Prueba gratis.',
  keywords: [
    'manual digital vivienda vacacional las palmas',
    'vivienda vacacional las palmas gran canaria',
    'alquiler vacacional canarias normativa',
    'ley 6/2025 canarias turismo',
    'decreto 113/2015 vivienda vacacional',
    'airbnb las palmas regulacion',
    'nomadas digitales las palmas',
    'manual huesped canarias',
  ],
  openGraph: {
    title: 'Manual Digital Vivienda Vacacional Las Palmas | Itineramio',
    description: 'Manual digital para vivienda vacacional en Las Palmas. Ley 6/2025, declaracion responsable. Prueba gratis.',
    url: 'https://www.itineramio.com/las-palmas',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio' }],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/las-palmas',
  },
}

export default function LasPalmasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
