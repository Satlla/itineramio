import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Como Hacer Check-in Automatico en Airbnb | Itineramio',
  description: 'Guia completa de check-in automatico: lockbox, cerraduras inteligentes, Nuki, codigos y apps. Configura el self check-in perfecto.',
  keywords: [
    'check-in automatico airbnb',
    'self check-in apartamento turistico',
    'cerradura inteligente airbnb',
    'nuki airbnb',
    'lockbox apartamento turistico',
    'check-in autonomo alquiler vacacional',
  ],
  openGraph: {
    title: 'Como Hacer Check-in Automatico en Airbnb | Itineramio',
    description: 'Guia completa de check-in automatico: lockbox, cerraduras inteligentes y apps.',
    url: 'https://www.itineramio.com/guia/como-hacer-check-in-automatico-airbnb',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'article',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio' }],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/guia/como-hacer-check-in-automatico-airbnb',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
