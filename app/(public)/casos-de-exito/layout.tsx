import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Casos de Éxito - Testimonios Anfitriones | Itineramio',
  description: 'Anfitriones que transformaron sus apartamentos con Itineramio. Testimonios reales, métricas de mejora y resultados en Airbnb y Booking.',
  keywords: [
    'testimonios airbnb',
    'casos exito alquiler vacacional',
    'reviews anfitriones',
    'experiencias itineramio',
    'superhost testimonios',
    'mejora resenas airbnb',
    'transformacion digital apartamentos',
    'resultados gestion turistica'
  ],
  openGraph: {
    title: 'Casos de Éxito - Anfitriones que Transformaron su Negocio',
    description: 'Testimonios reales de anfitriones que mejoraron sus reseñas y automatizaron su gestión con manuales digitales.',
    type: 'website',
    url: 'https://www.itineramio.com/casos-de-exito',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Casos de Éxito - Itineramio',
    description: 'Testimonios de anfitriones profesionales que usan manuales digitales.',
  },
  alternates: {
    canonical: 'https://www.itineramio.com/casos-de-exito',
  },
}

export default function CasosDeExitoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
