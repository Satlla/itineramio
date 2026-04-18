import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Apartamento Turistico Ibiza | Itineramio',
  description: 'Crea tu manual digital para huespedes en Ibiza. Moratoria, ecotasa, normativa y gestion de vivienda turistica.',
  keywords: ['manual digital apartamento turistico ibiza', 'moratoria viviendas turisticas ibiza', 'normativa alquiler ibiza', 'ecotasa ibiza', 'airbnb ibiza', 'dalt vila alquiler', 'licencia turismo ibiza', 'manual huesped ibiza'],
  openGraph: { title: 'Manual Digital Apartamento Turistico Ibiza | Itineramio', description: 'Crea tu manual digital para huespedes en Ibiza. Moratoria, ecotasa, normativa y gestion de vivienda turistica.', url: 'https://www.itineramio.com/ibiza', siteName: 'Itineramio', locale: 'es_ES', type: 'website' },
  alternates: { canonical: 'https://www.itineramio.com/ibiza' },
}

export default function IbizaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
