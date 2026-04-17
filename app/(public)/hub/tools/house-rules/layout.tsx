import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Normas de la Casa Airbnb Gratis | Itineramio',
  description: 'Crea normas de la casa para tu apartamento turístico gratis. Plantilla profesional para Airbnb y Booking: ruido, mascotas, fiestas y más.',
  keywords: [
    'normas de la casa apartamento airbnb',
    'house rules airbnb plantilla',
    'reglas hogar airbnb gratis',
    'normas hogar alquiler vacacional',
    'crear normas apartamento turistico',
    'house rules template espanol',
    'normas uso apartamento airbnb',
    'reglamento interno apartamento turistico'
  ],
  openGraph: {
    title: 'Generador de Normas de la Casa para Airbnb — Gratis',
    description: 'Crea normas profesionales para tu apartamento turístico en minutos. Plantilla personalizable gratis.',
    type: 'website',
    url: 'https://www.itineramio.com/hub/tools/house-rules',
    images: [
      {
        url: 'https://www.itineramio.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Generador normas de la casa Airbnb gratis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Normas de la Casa Airbnb Gratis',
    description: 'Crea normas profesionales para tu apartamento en minutos. Gratis.',
    images: ['https://www.itineramio.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/hub/tools/house-rules',
  },
}

export default function HouseRulesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
