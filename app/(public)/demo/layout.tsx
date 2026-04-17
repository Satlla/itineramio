import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Demo Gratis - Manual Digital Alojamiento | Itineramio',
  description: 'Crea gratis un manual digital para tu alojamiento vacacional en 2 minutos. Check-in, WiFi, recomendaciones y más. Sin registro.',
  openGraph: {
    title: 'Demo Gratis - Manual digital para tu alojamiento | Itineramio',
    description: 'Genera un manual digital profesional para tus huéspedes en 2 minutos. Gratis y sin registro.',
    type: 'website',
  },
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
