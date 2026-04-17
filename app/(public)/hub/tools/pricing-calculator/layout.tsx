import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calculadora Precio Noche Airbnb Gratis | Itineramio',
  description: 'Calcula el precio óptimo por noche para tu apartamento turístico. Basado en temporada, ocupación y competencia. Gratis para Airbnb y Booking.',
  keywords: [
    'calculadora precio noche airbnb',
    'como poner precio apartamento airbnb',
    'pricing alquiler vacacional',
    'precio optimo airbnb',
    'tarifas apartamento turistico',
    'calculadora tarifa noche booking',
    'precio dinamico airbnb',
    'como calcular precio alquiler vacacional'
  ],
  openGraph: {
    title: 'Calculadora de Precio por Noche para Airbnb — Gratis',
    description: 'Encuentra el precio óptimo para tu apartamento por temporada, días y competencia. Maximiza tus ingresos.',
    type: 'website',
    url: 'https://www.itineramio.com/hub/tools/pricing-calculator',
    images: [
      {
        url: 'https://www.itineramio.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Calculadora precio Airbnb gratis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora Precio Airbnb Gratis',
    description: 'Precio óptimo para tu apartamento turístico por temporada. Gratis.',
    images: ['https://www.itineramio.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/hub/tools/pricing-calculator',
  },
}

export default function PricingCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
