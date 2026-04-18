import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Alquiler Vacacional Tenerife Sur | Itineramio',
  description: 'Manual digital para vivienda vacacional en Tenerife Sur. Costa Adeje, Arona, Los Cristianos. Prueba gratis.',
  keywords: [
    'manual digital alquiler vacacional tenerife sur',
    'vivienda vacacional tenerife',
    'alquiler turistico costa adeje',
    'arona vivienda vacacional normativa',
    'los cristianos apartamento turistico',
    'airbnb tenerife sur regulacion',
    'auto check-in tenerife',
    'manual huesped tenerife',
  ],
  openGraph: {
    title: 'Manual Digital Alquiler Vacacional Tenerife Sur | Itineramio',
    description: 'Manual digital para vivienda vacacional en Tenerife Sur. Costa Adeje, Arona, Los Cristianos. Prueba gratis.',
    url: 'https://www.itineramio.com/tenerife-sur',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.itineramio.com/tenerife-sur',
  },
}

export default function TenerifeSurLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
