import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Normativa Alquiler Turistico Baleares | Itineramio',
  description: 'Normativa de alquiler turistico en Baleares. Ley 8/2012, plazas turisticas, moratoria, ITS y requisitos.',
  keywords: [
    'normativa alquiler turistico baleares',
    'ley 8/2012 turismo baleares',
    'plazas turisticas palma mallorca',
    'moratoria alquiler vacacional palma',
    'ITS impuesto estancias turisticas',
    'licencia vivienda turistica baleares',
    'vivienda turistica ibiza',
    'registro turismo baleares',
  ],
  openGraph: {
    title: 'Normativa Alquiler Turistico Baleares | Itineramio',
    description: 'Normativa de alquiler turistico en Baleares. Ley 8/2012, plazas turisticas, moratoria, ITS y requisitos.',
    url: 'https://www.itineramio.com/normativa/baleares',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio' }],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/normativa/baleares',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
}

export default function BalearesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
