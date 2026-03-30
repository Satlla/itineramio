import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Generador de Descripción Airbnb con IA Gratis | Crear Anuncio Optimizado | Itineramio',
  description: 'Genera la descripción perfecta para tu anuncio de Airbnb gratis con IA. Descripciones optimizadas para SEO de Airbnb, atractivas y que convierten. También para Booking y Vrbo.',
  keywords: [
    'generador descripcion airbnb',
    'crear descripcion apartamento airbnb',
    'descripcion optimizada airbnb gratis',
    'ia descripcion airbnb',
    'plantilla descripcion airbnb',
    'como escribir anuncio airbnb',
    'descripcion airbnb que convierte',
    'generador anuncio alquiler vacacional'
  ],
  openGraph: {
    title: 'Generador de Descripción Airbnb con IA — Gratis',
    description: 'Crea descripciones perfectas para tu anuncio de Airbnb con inteligencia artificial. Optimizadas para convertir.',
    type: 'website',
    url: 'https://www.itineramio.com/hub/tools/description-generator',
    images: [
      {
        url: 'https://www.itineramio.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Generador descripción Airbnb con IA gratis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador Descripción Airbnb con IA Gratis',
    description: 'Descripción perfecta para tu anuncio de Airbnb con IA. Gratis.',
    images: ['https://www.itineramio.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/hub/tools/description-generator',
  },
}

export default function DescriptionGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
