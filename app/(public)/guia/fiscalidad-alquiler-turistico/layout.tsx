import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fiscalidad Alquiler Turistico en Espana | Itineramio',
  description: 'Guia completa de fiscalidad para alquiler turistico: IVA, IRPF, facturas, VeriFactu y obligaciones fiscales para propietarios y gestores.',
  keywords: [
    'fiscalidad alquiler turistico',
    'iva alquiler turistico',
    'irpf alquiler vacacional',
    'factura huesped airbnb',
    'declarar ingresos airbnb',
    'verifactu alquiler turistico',
    'autonomo alquiler vacacional',
    'obligaciones fiscales vivienda turistica',
  ],
  openGraph: {
    title: 'Fiscalidad Alquiler Turistico en Espana | Itineramio',
    description: 'Guia completa de fiscalidad: IVA, IRPF, facturas, VeriFactu y obligaciones para propietarios y gestores.',
    url: 'https://www.itineramio.com/guia/fiscalidad-alquiler-turistico',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'article',
  },
  alternates: {
    canonical: 'https://www.itineramio.com/guia/fiscalidad-alquiler-turistico',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
