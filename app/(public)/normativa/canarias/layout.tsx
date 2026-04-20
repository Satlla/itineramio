import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Normativa Vivienda Vacacional Canarias | Itineramio',
  description: 'Normativa de vivienda vacacional en Canarias. Decreto 113/2015, Ley 6/2025, declaracion responsable y requisitos.',
  keywords: [
    'normativa vivienda vacacional canarias',
    'decreto 113/2015 canarias',
    'ley 6/2025 vivienda vacacional',
    'declaracion responsable canarias',
    'registro general turistico canarias',
    'vivienda vacacional las palmas',
    'vivienda vacacional tenerife sur',
    'SES hospedajes canarias',
  ],
  openGraph: {
    title: 'Normativa Vivienda Vacacional Canarias | Itineramio',
    description: 'Normativa de vivienda vacacional en Canarias. Decreto 113/2015, Ley 6/2025, declaracion responsable y requisitos.',
    url: 'https://www.itineramio.com/normativa/canarias',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio' }],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/normativa/canarias',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
}

export default function CanariasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
