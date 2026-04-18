import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Como Conseguir Superhost en Airbnb 2026 | Itineramio',
  description: 'Requisitos y estrategias para conseguir y mantener el badge Superhost en Airbnb. Tips practicos de anfitriones profesionales.',
  keywords: [
    'como conseguir superhost airbnb',
    'requisitos superhost airbnb 2026',
    'superhost airbnb tips',
    'badge superhost airbnb',
    'mejorar resenas airbnb',
    'anfitrion profesional airbnb',
  ],
  openGraph: {
    title: 'Como Conseguir Superhost en Airbnb 2026 | Itineramio',
    description: 'Requisitos y estrategias para conseguir el badge Superhost.',
    url: 'https://www.itineramio.com/guia/como-conseguir-superhost-airbnb',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'article',
  },
  alternates: {
    canonical: 'https://www.itineramio.com/guia/como-conseguir-superhost-airbnb',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
