import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calculadora de Ocupación Airbnb Gratis | Tasa Ocupación Apartamento | Itineramio',
  description: 'Calcula la tasa de ocupación de tu apartamento turístico gratis. Compara con la media del mercado en tu zona. Herramienta gratuita para anfitriones de Airbnb y Booking.',
  keywords: [
    'calculadora ocupacion airbnb',
    'tasa ocupacion apartamento turistico',
    'calcular ocupacion alquiler vacacional',
    'ocupacion media airbnb',
    'porcentaje ocupacion apartamento',
    'calculadora noches ocupadas airbnb',
    'ocupacion booking gratis',
    'tasa ocupacion media españa airbnb'
  ],
  openGraph: {
    title: 'Calculadora de Ocupación Airbnb — Tasa de Ocupación Gratis',
    description: 'Calcula y compara la tasa de ocupación de tu apartamento con la media del mercado. Gratis.',
    type: 'website',
    url: 'https://www.itineramio.com/hub/tools/occupancy-calculator',
    images: [
      {
        url: 'https://www.itineramio.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Calculadora ocupación Airbnb gratis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora Ocupación Airbnb Gratis',
    description: 'Calcula la tasa de ocupación de tu apartamento turístico. Gratis.',
    images: ['https://www.itineramio.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/hub/tools/occupancy-calculator',
  },
}

export default function OccupancyCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
