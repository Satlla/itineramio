import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Apartamento Turistico A Coruna | Itineramio',
  description: 'Manual digital para VUT en A Coruna. Decreto 11/2023 Galicia, declaracion responsable, sin tasa turistica. Gestiona huespedes y cumple la normativa.',
  keywords: [
    'manual digital apartamento turistico a coruna',
    'VUT a coruna registro',
    'Decreto 11/2023 Galicia alquiler vacacional',
    'declaracion responsable xunta galicia',
    'alquiler vacacional a coruna',
    'vivienda uso turistico galicia',
    'airbnb a coruna regulacion',
    'manual huesped a coruna',
  ],
  openGraph: {
    title: 'Manual Digital Apartamento Turistico A Coruna | Itineramio',
    description: 'Manual digital para VUT en A Coruna. Decreto 11/2023 Galicia, declaracion responsable, sin tasa turistica. Gestiona huespedes y cumple la normativa.',
    url: 'https://www.itineramio.com/a-coruna',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.itineramio.com/a-coruna',
  },
}

export default function ACorunaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
