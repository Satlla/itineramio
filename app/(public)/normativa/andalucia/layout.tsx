import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Normativa Vivienda Turistica Andalucia | Itineramio',
  description: 'Normativa de vivienda turistica en Andalucia. Decreto 28/2016, registro, requisitos y sanciones para Sevilla, Malaga y Granada.',
  keywords: [
    'normativa vivienda turistica andalucia',
    'decreto 28/2016 vivienda fines turisticos',
    'licencia piso turistico sevilla',
    'registro apartamento turistico malaga',
    'vivienda turistica granada',
    'multas piso turistico andalucia',
    'requisitos VFT andalucia',
    'SES hospedajes andalucia',
  ],
  openGraph: {
    title: 'Normativa Vivienda Turistica Andalucia | Itineramio',
    description: 'Normativa de vivienda turistica en Andalucia. Decreto 28/2016, registro, requisitos y sanciones para Sevilla, Malaga y Granada.',
    url: 'https://www.itineramio.com/normativa/andalucia',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.itineramio.com/normativa/andalucia',
  },
}

export default function AndaluciaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
