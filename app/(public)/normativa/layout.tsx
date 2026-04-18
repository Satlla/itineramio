import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Normativa Vivienda Turistica por Comunidades | Itineramio',
  description: 'Guia completa de normativa de vivienda turistica en Espana por comunidades autonomas. Leyes, requisitos, sanciones y tasa turistica.',
  openGraph: {
    title: 'Normativa Vivienda Turistica por Comunidades | Itineramio',
    description: 'Guia completa de normativa de vivienda turistica en Espana por comunidades autonomas.',
    url: 'https://www.itineramio.com/normativa',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.itineramio.com/normativa',
  },
}

export default function NormativaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
