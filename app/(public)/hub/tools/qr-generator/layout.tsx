import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Generador QR Gratis para Apartamentos | Itineramio',
  description: 'Crea códigos QR para tu apartamento turístico gratis. QR WiFi, instrucciones, check-in y normas. Sin registro, descarga instantánea.',
  keywords: [
    'generador qr gratis apartamento',
    'crear codigo qr apartamento turistico',
    'qr code wifi gratis',
    'generador qr airbnb',
    'codigo qr manual huesped',
    'qr code alquiler vacacional',
    'generador qr online gratis',
    'qr code apartamento booking'
  ],
  openGraph: {
    title: 'Generador de Códigos QR Gratis para Apartamentos Turísticos',
    description: 'Crea QR codes personalizados para WiFi, instrucciones y zonas de tu apartamento. Gratis, sin registro.',
    type: 'website',
    url: 'https://www.itineramio.com/hub/tools/qr-generator',
    images: [
      {
        url: 'https://www.itineramio.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Generador QR gratis para apartamentos turísticos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador QR Gratis para Apartamentos',
    description: 'Crea QR codes para WiFi e instrucciones de tu apartamento. Gratis y sin registro.',
    images: ['https://www.itineramio.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/hub/tools/qr-generator',
  },
}

export default function QRGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
