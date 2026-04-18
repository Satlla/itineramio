import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Apartamento Turistico San Sebastian | Itineramio',
  description: 'Manual digital para vivienda turistica en San Sebastian. Normativa vasca, pintxos, playas y eventos. Prueba gratis 15 dias.',
  keywords: [
    'manual digital apartamento turistico san sebastian',
    'vivienda turistica san sebastian normativa',
    'alquiler vacacional donostia',
    'gestion apartamento turistico pais vasco',
    'registro vasco empresas turisticas',
    'airbnb san sebastian regulacion',
    'manual huesped donostia',
    'vivienda uso turistico casco viejo',
  ],
  openGraph: {
    title: 'Manual Digital Apartamento Turistico San Sebastian | Itineramio',
    description: 'Manual digital para vivienda turistica en San Sebastian. Normativa vasca, pintxos, playas y eventos. Prueba gratis 15 dias.',
    url: 'https://www.itineramio.com/san-sebastian',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.itineramio.com/san-sebastian',
  },
}

export default function SanSebastianLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
