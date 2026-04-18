import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Apartamento Turistico Cadiz | Itineramio',
  description: 'Crea tu manual digital para huespedes en Cadiz. Normativa, suspension de licencias, zonas y gestion de vivienda turistica.',
  keywords: ['manual digital apartamento turistico cadiz', 'vivienda turistica cadiz', 'suspension licencias turisticas cadiz', 'alquiler vacacional cadiz', 'airbnb cadiz', 'carnaval cadiz alquiler', 'normativa VUT cadiz', 'manual huesped cadiz'],
  openGraph: { title: 'Manual Digital Apartamento Turistico Cadiz | Itineramio', description: 'Crea tu manual digital para huespedes en Cadiz. Normativa, suspension de licencias, zonas y gestion de vivienda turistica.', url: 'https://www.itineramio.com/cadiz', siteName: 'Itineramio', locale: 'es_ES', type: 'website' },
  alternates: { canonical: 'https://www.itineramio.com/cadiz' },
}

export default function CadizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
