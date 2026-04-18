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
  },
  alternates: {
    canonical: 'https://www.itineramio.com/normativa/baleares',
  },
}

export default function BalearesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
