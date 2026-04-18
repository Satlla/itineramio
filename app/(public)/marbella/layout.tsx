import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Apartamento Turistico Marbella | Itineramio',
  description: 'Crea tu manual digital para huespedes en Marbella. Normativa, zonas y gestion de vivienda turistica en la Costa del Sol.',
  keywords: [
    'manual digital apartamento turistico marbella',
    'vivienda turistica marbella normativa',
    'alquiler vacacional marbella',
    'gestion apartamento turistico marbella',
    'licencia turismo marbella',
    'puerto banus alquiler vacacional',
    'airbnb marbella regulacion',
    'manual huesped marbella',
  ],
  openGraph: {
    title: 'Manual Digital Apartamento Turistico Marbella | Itineramio',
    description: 'Crea tu manual digital para huespedes en Marbella. Normativa, zonas y gestion de vivienda turistica en la Costa del Sol.',
    url: 'https://www.itineramio.com/marbella',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.itineramio.com/marbella',
  },
}

export default function MarbellLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
