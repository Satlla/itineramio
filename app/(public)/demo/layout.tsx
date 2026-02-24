import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Demo Gratis - Genera el manual digital de tu alojamiento | Itineramio',
  description: 'Crea gratis un manual digital completo para tu alojamiento vacacional en 2 minutos. Con recomendaciones cercanas, check-in, WiFi y más. Sin registro.',
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
