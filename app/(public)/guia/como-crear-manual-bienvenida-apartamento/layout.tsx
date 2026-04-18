import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Como Crear un Manual de Bienvenida | Itineramio',
  description: 'Tutorial para crear un manual de bienvenida profesional para tu apartamento turistico. Que incluir, formato y herramientas.',
  keywords: [
    'manual bienvenida apartamento turistico',
    'guia bienvenida huespedes',
    'crear manual airbnb',
    'welcome book apartamento',
    'guia digital apartamento',
    'que poner en manual huespedes',
  ],
  openGraph: {
    title: 'Como Crear un Manual de Bienvenida | Itineramio',
    description: 'Tutorial para crear un manual de bienvenida profesional para tu apartamento.',
    url: 'https://www.itineramio.com/guia/como-crear-manual-bienvenida-apartamento',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'article',
  },
  alternates: {
    canonical: 'https://www.itineramio.com/guia/como-crear-manual-bienvenida-apartamento',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
