import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Funcionalidades - Manuales Digitales | Itineramio',
  description: 'Manuales digitales por zonas, QR únicos, check-in automático, traducción a 10 idiomas y analytics. Descubre todo lo que ofrece Itineramio. Prueba gratis.',
  keywords: [
    'funcionalidades software apartamentos turisticos',
    'características manual digital airbnb',
    'qué hace itineramio',
    'manual digital zonas apartamento',
    'codigo qr manual huespedes',
    'check-in digital automatico',
    'traduccion automatica manual apartamento',
    'analytics apartamento turistico',
    'automatizacion airbnb funciones',
    'software gestion alquiler vacacional funciones'
  ],
  openGraph: {
    title: 'Funcionalidades de Itineramio — Todo lo que Necesitas',
    description: 'Manuales digitales por zonas, QR únicos, traducción automática a 10 idiomas, analytics y más. La solución completa para anfitriones profesionales.',
    type: 'website',
    url: 'https://www.itineramio.com/funcionalidades',
    images: [
      {
        url: 'https://www.itineramio.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Funcionalidades de Itineramio - Software para Apartamentos Turísticos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Funcionalidades de Itineramio — Software para Apartamentos Turísticos',
    description: 'Manuales digitales, QR codes, traducción automática, analytics y más. Prueba gratis.',
    images: ['https://www.itineramio.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/funcionalidades',
  },
}

export default function FuncionalidadesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
