import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Normativa Vivienda Turistica Madrid | Itineramio',
  description: 'Guia completa de la normativa de vivienda turistica en la Comunidad de Madrid. Decreto 79/2014, declaracion responsable, registro estatal y novedades 2026.',
  keywords: [
    'normativa vivienda turistica madrid',
    'decreto 79/2014 madrid',
    'declaracion responsable madrid vut',
    'registro vivienda turistica madrid',
    'habilitacion turistica madrid',
    'alquiler vacacional madrid',
    'vut madrid 2025',
    'registro estatal arrendamientos madrid',
    'inspeccion vivienda turistica madrid',
    'placa identificativa vut madrid',
  ],
  openGraph: {
    title: 'Normativa Vivienda Turistica Madrid | Itineramio',
    description: 'Guia completa de la normativa de vivienda turistica en la Comunidad de Madrid. Decreto 79/2014, declaracion responsable, registro estatal y novedades 2026.',
    url: 'https://www.itineramio.com/normativa/madrid',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio' }],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/normativa/madrid',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
}

export default function MadridNormativaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
