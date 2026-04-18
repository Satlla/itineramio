import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Normativa Vivienda Turistica Cataluna | Itineramio',
  description: 'Normativa HUT en Cataluna. Llei 13/2002, PEUAT Barcelona, tasa turistica 9,50 EUR y moratoria de licencias.',
  keywords: [
    'normativa HUT cataluna',
    'NIRTC vivienda turistica barcelona',
    'PEUAT barcelona pisos turisticos',
    'tasa turistica barcelona 2026',
    'llei 13/2002 turisme catalunya',
    'decret 75/2020 cataluna',
    'licencia piso turistico barcelona',
    'mossos registro viajeros',
  ],
  openGraph: {
    title: 'Normativa Vivienda Turistica Cataluna | Itineramio',
    description: 'Normativa HUT en Cataluna. Llei 13/2002, PEUAT Barcelona, tasa turistica 9,50 EUR y moratoria de licencias.',
    url: 'https://www.itineramio.com/normativa/cataluna',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.itineramio.com/normativa/cataluna',
  },
}

export default function CatalunaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
