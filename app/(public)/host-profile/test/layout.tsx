import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Test: ¿Qué Tipo de Anfitrión Eres? | Itineramio',
  description: 'Descubre tu perfil como anfitrión en 3 minutos. Test gratis con resultados personalizados: fortalezas, puntos ciegos y consejos para mejorar.',
  keywords: [
    'test anfitrión airbnb',
    'tipo de host',
    'perfil anfitrión',
    'test personalidad airbnb',
    'mejorar hosting',
  ],
  openGraph: {
    title: '¿Qué tipo de anfitrión eres? 🏠',
    description: 'Descubre tu perfil en 3 minutos. 8 arquetipos, resultados personalizados, consejos para mejorar. Test gratuito.',
    url: 'https://www.itineramio.com/host-profile/test',
    siteName: 'Itineramio',
    images: [
      {
        url: 'https://www.itineramio.com/og-quiz-anfitrion.jpg',
        width: 1200,
        height: 630,
        alt: '¿Qué tipo de anfitrión eres? - Test de Itineramio',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Qué tipo de anfitrión eres? 🏠',
    description: 'Descubre tu perfil en 3 minutos. Test gratuito con resultados personalizados.',
    images: ['https://www.itineramio.com/og-quiz-anfitrion.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
