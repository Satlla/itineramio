import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Apartamento Turistico Barcelona | Itineramio',
  description: 'Manual digital para HUT en Barcelona. PEUAT, tasa turistica, normativa 2026. Reduce incidencias vecinales. Prueba gratis.',
  keywords: [
    'manual digital apartamento turistico barcelona',
    'HUT barcelona registro',
    'PEUAT barcelona normativa',
    'tasa turistica barcelona',
    'alquiler vacacional barcelona',
    'vivienda uso turistico barcelona',
    'airbnb barcelona regulacion',
    'manual huesped barcelona',
  ],
  openGraph: {
    title: 'Manual Digital Apartamento Turistico Barcelona | Itineramio',
    description: 'Manual digital para HUT en Barcelona. PEUAT, tasa turistica, normativa 2026. Reduce incidencias vecinales. Prueba gratis.',
    url: 'https://www.itineramio.com/barcelona',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.itineramio.com/barcelona',
  },
}

export default function BarcelonaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
