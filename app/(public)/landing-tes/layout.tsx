import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: 'noindex, nofollow',
  title: 'Itineramio — Tu alojamiento funciona solo',
  description: 'El manual digital que responde las preguntas de tus huéspedes automáticamente. Crea tu guía, coloca los QR, y deja de repetir.',
  openGraph: {
    title: 'Itineramio — Tu alojamiento funciona solo',
    description: 'El manual digital que responde las preguntas de tus huéspedes automáticamente.',
    images: [
      {
        url: 'https://www.itineramio.com/images/neighbor.webp',
        width: 1920,
        height: 1080,
        alt: 'Complejo de apartamentos conectados con Itineramio',
      },
    ],
    type: 'website',
    siteName: 'Itineramio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Itineramio — Tu alojamiento funciona solo',
    description: 'El manual digital que responde las preguntas de tus huéspedes automáticamente.',
    images: ['https://www.itineramio.com/images/neighbor.webp'],
  },
}

export default function LandingTesLayout({ children }: { children: React.ReactNode }) {
  return children
}
