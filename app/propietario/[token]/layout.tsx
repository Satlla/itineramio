import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resumen Mensual | Portal de Propietario',
  description: 'Consulta el detalle de tus reservas, liquidación y facturas del mes.',
  openGraph: {
    title: 'Resumen Mensual de tu Propiedad',
    description: 'Consulta el detalle de tus reservas, liquidación y facturas del mes.',
    type: 'website',
    images: [
      {
        url: '/propietario/og-image',
        width: 1200,
        height: 630,
        alt: 'Portal de Propietario - Resumen Mensual'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resumen Mensual de tu Propiedad',
    description: 'Consulta el detalle de tus reservas, liquidación y facturas del mes.',
    images: ['/propietario/og-image']
  },
  robots: {
    index: false,
    follow: false
  }
}

export default function OwnerPortalLayout({
  children
}: {
  children: React.ReactNode
}) {
  return children
}
