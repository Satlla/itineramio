import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Casos de Éxito | Itineramio - Testimonios de Anfitriones',
  description: 'Descubre cómo anfitriones como tú han transformado la experiencia de sus huéspedes con Itineramio. Testimonios reales y resultados comprobados.',
  keywords: 'testimonios airbnb, casos de éxito alquiler vacacional, reviews anfitriones, experiencias itineramio'
}

export default function CasosDeExitoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
