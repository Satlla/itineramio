import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Academia Itineramio | Cursos y Formación para Anfitriones',
  description: 'Aprende a gestionar apartamentos turísticos como un profesional. Cursos, certificaciones y formación para anfitriones de Airbnb, Booking y alquiler vacacional.',
  keywords: [
    'cursos apartamentos turisticos',
    'formacion anfitriones airbnb',
    'academia alquiler vacacional',
    'certificacion superhost',
    'cursos gestion propiedades',
    'formacion property manager',
    'aprender airbnb hosting',
    'curso profesional alquiler turistico'
  ],
  openGraph: {
    title: 'Academia Itineramio - Formación para Anfitriones Profesionales',
    description: 'Cursos y certificaciones para convertirte en un anfitrión profesional. Aprende gestión de apartamentos turísticos, comunicación con huéspedes y más.',
    type: 'website',
    url: 'https://www.itineramio.com/academia',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Academia Itineramio - Cursos para Anfitriones',
    description: 'Formación profesional para gestión de apartamentos turísticos y alquiler vacacional.',
  },
  alternates: {
    canonical: 'https://www.itineramio.com/academia',
  },
}

export default function AcademiaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
