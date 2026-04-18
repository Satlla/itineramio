import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Apartamento Turistico Santander | Itineramio',
  description: 'Manual digital para VUT en Santander. Ley 16/2014 Cantabria, licencias obligatorias, sin tasa turistica. Gestiona tus huespedes con profesionalidad.',
  keywords: [
    'manual digital apartamento turistico santander',
    'VUT santander registro',
    'Ley 16/2014 Cantabria alquiler vacacional',
    'licencia turistica santander',
    'alquiler vacacional cantabria',
    'vivienda uso turistico santander',
    'airbnb santander regulacion',
    'manual huesped santander',
  ],
  openGraph: {
    title: 'Manual Digital Apartamento Turistico Santander | Itineramio',
    description: 'Manual digital para VUT en Santander. Ley 16/2014 Cantabria, licencias obligatorias, sin tasa turistica. Gestiona tus huespedes con profesionalidad.',
    url: 'https://www.itineramio.com/santander',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.itineramio.com/santander',
  },
}

export default function SantanderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
