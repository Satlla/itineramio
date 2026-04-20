import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Apartamento Turistico Tarragona | Itineramio',
  description: 'Crea tu manual digital para huespedes en Tarragona. Normativa Cataluna, NIRTC, tasa turistica y patrimonio romano.',
  keywords: ['manual digital apartamento turistico tarragona', 'vivienda turistica tarragona', 'NIRTC tarragona', 'tasa turistica tarragona', 'airbnb tarragona', 'patrimonio romano tarragona', 'gestion huesped tarragona', 'manual huesped tarragona'],
  openGraph: {
    title: 'Manual Digital Apartamento Turistico Tarragona | Itineramio',
    description: 'Crea tu manual digital para huespedes en Tarragona. Normativa Cataluna, NIRTC, tasa turistica y patrimonio romano.',
    url: 'https://www.itineramio.com/tarragona',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio' }],
  },
  alternates: { canonical: 'https://www.itineramio.com/tarragona' },
  twitter: { card: 'summary_large_image', images: ['/og-image.jpg'] },
}

export default function TarragonaLayout({ children }: { children: React.ReactNode }) {
  return <>{}</>
}
