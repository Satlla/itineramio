import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checklist de Limpieza para Airbnb Gratis | Plantilla PDF | Itineramio',
  description: 'Descarga gratis el checklist de limpieza para apartamentos turísticos. Protocolo profesional para Airbnb y Booking: habitaciones, baños, cocina, áreas comunes. Lista verificación imprimible.',
  keywords: [
    'checklist limpieza airbnb',
    'lista verificacion limpieza apartamento',
    'protocolo limpieza alquiler vacacional',
    'checklist limpieza apartamento turistico',
    'plantilla limpieza airbnb gratis',
    'checklist camarera apartamento',
    'limpieza entre estancias airbnb',
    'lista tareas limpieza apartamento'
  ],
  openGraph: {
    title: 'Checklist de Limpieza para Airbnb — Plantilla Profesional Gratis',
    description: 'Protocolo de limpieza profesional para apartamentos turísticos. Descarga gratis y úsalo con tus limpiadoras.',
    type: 'website',
    url: 'https://www.itineramio.com/hub/tools/cleaning-checklist',
    images: [
      {
        url: 'https://www.itineramio.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Checklist limpieza Airbnb gratis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Checklist Limpieza Airbnb Gratis',
    description: 'Protocolo de limpieza profesional para apartamentos. Descarga gratis.',
    images: ['https://www.itineramio.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/hub/tools/cleaning-checklist',
  },
}

export default function CleaningChecklistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
