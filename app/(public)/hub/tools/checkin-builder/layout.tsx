import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Plantilla Check-In Apartamento Gratis | Instrucciones Llegada Huéspedes | Itineramio',
  description: 'Crea instrucciones de llegada profesionales para tus huéspedes gratis. Plantilla de check-in digital: cómo llegar, entrada, normas, WiFi y más. Para Airbnb y Booking.',
  keywords: [
    'plantilla check-in apartamento',
    'instrucciones llegada huespedes',
    'guia check-in digital apartamento',
    'instrucciones entrada apartamento airbnb',
    'plantilla bienvenida huesped gratis',
    'check-in online apartamento',
    'mensaje bienvenida airbnb',
    'instrucciones acceso apartamento turistico'
  ],
  openGraph: {
    title: 'Plantilla Check-In para Apartamentos — Instrucciones de Llegada Gratis',
    description: 'Crea instrucciones de llegada profesionales para tus huéspedes en minutos. Gratis.',
    type: 'website',
    url: 'https://www.itineramio.com/hub/tools/checkin-builder',
    images: [
      {
        url: 'https://www.itineramio.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Plantilla check-in apartamento gratis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plantilla Check-In Apartamento Gratis',
    description: 'Instrucciones de llegada profesionales para tus huéspedes. Gratis.',
    images: ['https://www.itineramio.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/hub/tools/checkin-builder',
  },
}

export default function CheckinBuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
