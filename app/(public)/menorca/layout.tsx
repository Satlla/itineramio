import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Apartamento Turistico Menorca | Itineramio',
  description: 'Manual digital para VUT en Menorca. Ecotasa balear, PIAT, moratoria plurifamiliares, normativa 2026. Reduce incidencias y gestiona huespedes.',
  keywords: [
    'manual digital apartamento turistico menorca',
    'VUT menorca registro',
    'ecotasa balear menorca',
    'PIAT menorca normativa',
    'alquiler vacacional menorca',
    'vivienda uso turistico baleares',
    'airbnb menorca regulacion',
    'manual huesped menorca',
  ],
  openGraph: {
    title: 'Manual Digital Apartamento Turistico Menorca | Itineramio',
    description: 'Manual digital para VUT en Menorca. Ecotasa balear, PIAT, moratoria plurifamiliares, normativa 2026. Reduce incidencias y gestiona huespedes.',
    url: 'https://www.itineramio.com/menorca',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.itineramio.com/menorca',
  },
}

export default function MenorcaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
