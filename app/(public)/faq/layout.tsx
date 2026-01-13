import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes (FAQ) | Soporte Itineramio',
  description: 'Resuelve tus dudas sobre manuales digitales para apartamentos turísticos. Guías sobre registro, propiedades, pagos, idiomas y funcionalidades de Itineramio.',
  keywords: [
    'faq apartamentos turisticos',
    'preguntas frecuentes airbnb',
    'ayuda manual digital',
    'soporte itineramio',
    'dudas alquiler vacacional',
    'como usar itineramio',
    'guia usuario apartamento turistico'
  ],
  openGraph: {
    title: 'Preguntas Frecuentes - Itineramio',
    description: 'Encuentra respuestas a todas tus dudas sobre manuales digitales para apartamentos turísticos y alquiler vacacional.',
    type: 'website',
    url: 'https://www.itineramio.com/faq',
  },
  twitter: {
    card: 'summary',
    title: 'FAQ - Itineramio',
    description: 'Resuelve tus dudas sobre manuales digitales para apartamentos turísticos.',
  },
  alternates: {
    canonical: 'https://www.itineramio.com/faq',
  },
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
