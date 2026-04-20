import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Digital Apartamento Turistico Menorca | Itineramio',
  description: 'Crea tu manual digital para huespedes en Menorca. Moratoria Baleares, ecotasa, plazas turisticas y calas.',
  keywords: ['manual digital apartamento turistico menorca', 'moratoria plazas turisticas menorca', 'ecotasa menorca', 'alquiler vacacional menorca', 'airbnb menorca', 'calas menorca', 'normativa baleares menorca', 'manual huesped menorca'],
  openGraph: {
    title: 'Manual Digital Apartamento Turistico Menorca | Itineramio',
    description: 'Crea tu manual digital para huespedes en Menorca. Moratoria Baleares, ecotasa, plazas turisticas y calas.',
    url: 'https://www.itineramio.com/menorca',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio' }],
  },
  alternates: { canonical: 'https://www.itineramio.com/menorca' },
  twitter: { card: 'summary_large_image', images: ['/og-image.jpg'] },
}

export default function MenorcaLayout({ children }: { children: React.ReactNode }) {
  return <>{}</>
}
