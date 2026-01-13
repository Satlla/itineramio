import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hub de Herramientas para Apartamentos Turísticos | Itineramio',
  description: 'Herramientas gratuitas para anfitriones: calculadora de rentabilidad, generador de QR, plantillas de mensajes, checklist de limpieza y más. Optimiza tu alquiler vacacional.',
  keywords: [
    'herramientas apartamentos turisticos',
    'calculadora rentabilidad airbnb',
    'generador qr apartamento',
    'plantillas mensajes huesped',
    'checklist limpieza airbnb',
    'herramientas gratis anfitriones',
    'calculadora alquiler vacacional',
    'recursos property manager',
    'tools airbnb host'
  ],
  openGraph: {
    title: 'Hub de Herramientas Gratuitas para Anfitriones',
    description: 'Calculadoras, generadores, plantillas y recursos gratuitos para optimizar la gestión de tu apartamento turístico.',
    type: 'website',
    url: 'https://www.itineramio.com/hub',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hub de Herramientas - Itineramio',
    description: 'Herramientas gratuitas para anfitriones de Airbnb y alquiler vacacional.',
  },
  alternates: {
    canonical: 'https://www.itineramio.com/hub',
  },
}

export default function HubLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
