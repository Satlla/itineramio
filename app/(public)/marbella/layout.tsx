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
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio' }],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/marbella',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
}

export default function MarbellLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
