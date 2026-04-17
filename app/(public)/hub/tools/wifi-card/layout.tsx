import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tarjeta WiFi Apartamento Gratis | Itineramio',
  description: 'Crea tarjetas WiFi imprimibles para tu apartamento turístico gratis. Diseños modernos con red y contraseña. Para Airbnb y Booking.',
  keywords: [
    'tarjeta wifi apartamento gratis',
    'crear tarjeta wifi imprimible',
    'wifi card airbnb template',
    'cartel wifi apartamento turistico',
    'plantilla wifi alquiler vacacional',
    'diseño tarjeta wifi gratis',
    'generador tarjeta wifi qr',
    'wifi card apartamento bonita'
  ],
  openGraph: {
    title: 'Generador de Tarjeta WiFi para Apartamentos — Gratis e Imprimible',
    description: 'Crea tarjetas WiFi con diseño profesional para tu apartamento turístico. Gratis, imprimibles, con QR.',
    type: 'website',
    url: 'https://www.itineramio.com/hub/tools/wifi-card',
    images: [
      {
        url: 'https://www.itineramio.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Generador tarjeta WiFi apartamento gratis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarjeta WiFi Apartamento Gratis',
    description: 'Tarjetas WiFi imprimibles y profesionales para tu apartamento. Gratis.',
    images: ['https://www.itineramio.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/hub/tools/wifi-card',
  },
}

export default function WifiCardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
