import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Como Registrar Viajeros en SES.Hospedajes | Itineramio',
  description: 'Tutorial paso a paso para registrar viajeros en SES.Hospedajes. Obligatorio desde 2024 para todos los alojamientos turisticos.',
  keywords: [
    'SES hospedajes tutorial',
    'registrar viajeros airbnb',
    'parte de viajeros apartamento turistico',
    'SES hospedajes como funciona',
    'registro viajeros obligatorio espana',
    'RD 933/2021 hospedajes',
  ],
  openGraph: {
    title: 'Como Registrar Viajeros en SES.Hospedajes | Itineramio',
    description: 'Tutorial paso a paso para registrar viajeros en SES.Hospedajes.',
    url: 'https://www.itineramio.com/guia/como-registrar-viajeros-ses-hospedajes',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'article',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio' }],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/guia/como-registrar-viajeros-ses-hospedajes',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
