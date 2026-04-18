import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Apartamento Turistico Torrevieja | Itineramio',
  description: 'Manual digital para vivienda turistica en Torrevieja. Normativa valenciana CPT, playas, lagunas y turismo nordico. Prueba gratis 15 dias.',
  keywords: [
    'manual digital apartamento turistico torrevieja',
    'vivienda turistica torrevieja normativa',
    'alquiler vacacional torrevieja',
    'gestion apartamento turistico costa blanca sur',
    'CPT registro turistico torrevieja',
    'airbnb torrevieja regulacion',
    'manual huesped torrevieja',
    'ley 15/2018 vivienda turistica torrevieja',
  ],
  openGraph: {
    title: 'Manual Digital Apartamento Turistico Torrevieja | Itineramio',
    description: 'Manual digital para vivienda turistica en Torrevieja. Normativa valenciana CPT, playas, lagunas y turismo nordico. Prueba gratis 15 dias.',
    url: 'https://www.itineramio.com/torrevieja',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.itineramio.com/torrevieja',
  },
}

export default function TorreviejaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
