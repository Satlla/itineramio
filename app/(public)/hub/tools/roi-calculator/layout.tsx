import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calculadora ROI Airbnb Gratis | Itineramio',
  description: 'Calcula el ROI de tu apartamento turístico gratis. Rentabilidad real, gastos, ocupación y beneficio neto. Para anfitriones de alquiler vacacional.',
  keywords: [
    'calculadora roi airbnb',
    'calcular rentabilidad apartamento turistico',
    'roi alquiler vacacional',
    'rentabilidad airbnb calculadora',
    'calcular beneficio apartamento turistico',
    'calculadora ingresos airbnb',
    'retorno inversion alquiler',
    'roi apartamento vacacional gratis'
  ],
  openGraph: {
    title: 'Calculadora ROI Airbnb — Rentabilidad Apartamento Turístico Gratis',
    description: 'Calcula la rentabilidad real de tu apartamento turístico: ingresos, gastos, ocupación y ROI. Gratis.',
    type: 'website',
    url: 'https://www.itineramio.com/hub/tools/roi-calculator',
    images: [
      {
        url: 'https://www.itineramio.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Calculadora ROI Airbnb gratis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora ROI Airbnb Gratis',
    description: 'Calcula la rentabilidad real de tu apartamento turístico. Gratis.',
    images: ['https://www.itineramio.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/hub/tools/roi-calculator',
  },
}

export default function ROICalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
