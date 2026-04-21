import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Software Gestion Alquiler Vacacional | Itineramio',
  description: 'Software de gestion y facturacion para gestores de alquiler vacacional. Liquidaciones, facturas con VeriFactu, importacion de reservas.',
  keywords: [
    'software gestion alquiler vacacional',
    'facturacion apartamentos turisticos',
    'liquidaciones propietarios alquiler vacacional',
    'verifactu alquiler turistico',
    'importar reservas airbnb',
    'software gestor apartamentos',
    'factura gestor propietario',
    'PMS alquiler vacacional espana',
  ],
  openGraph: {
    title: 'Software Gestion Alquiler Vacacional | Itineramio',
    description: 'Liquidaciones, facturas con VeriFactu, importacion de reservas. Para gestores de 5-50 propiedades.',
    url: 'https://www.itineramio.com/gestion-alquiler-vacacional',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio' }],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/gestion-alquiler-vacacional',
  },
  twitter: { card: 'summary_large_image', images: ['/og-image.jpg'] },
}

export default function GestionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
