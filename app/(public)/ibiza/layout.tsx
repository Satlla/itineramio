import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Apartamento Turistico Ibiza | Itineramio',
  description: 'Crea tu manual digital para huespedes en Ibiza. Moratoria, ecotasa, normativa y gestion de vivienda turistica.',
  keywords: ['manual digital apartamento turistico ibiza', 'moratoria viviendas turisticas ibiza', 'normativa alquiler ibiza', 'ecotasa ibiza', 'airbnb ibiza', 'dalt vila alquiler', 'licencia turismo ibiza', 'manual huesped ibiza'],
  openGraph: {
    title: 'Manual Digital Apartamento Turistico Ibiza | Itineramio',
    description: 'Crea tu manual digital para huespedes en Ibiza. Moratoria, ecotasa, normativa y gestion de vivienda turistica.',
    url: 'https://www.itineramio.com/ibiza',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio' }],
  },
  alternates: { canonical: 'https://www.itineramio.com/ibiza' },
  twitter: { card: 'summary_large_image', images: ['/og-image.jpg'] },
}

export default function IbizaLayout({ children }: { children: React.ReactNode }) {
  return <>{}</>
}
