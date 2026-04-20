import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Normativa Vivienda Turistica Valencia | Itineramio',
  description: 'Normativa de vivienda turistica en la Comunitat Valenciana. Ley 15/2018, limite 10 dias, requisitos y sanciones.',
  keywords: [
    'normativa vivienda turistica valencia',
    'licencia vivienda turistica alicante',
    'decreto 10/2021 comunitat valenciana',
    'limite 10 dias alquiler turistico valencia',
    'informe compatibilidad urbanistica VUT',
    'registro turismo comunitat valenciana',
    'requisitos vivienda turistica valencia',
    'multas piso turistico valencia',
  ],
  openGraph: {
    title: 'Normativa Vivienda Turistica Valencia | Itineramio',
    description: 'Normativa de vivienda turistica en la Comunitat Valenciana. Ley 15/2018, limite 10 dias, requisitos y sanciones.',
    url: 'https://www.itineramio.com/normativa/comunitat-valenciana',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio' }],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/normativa/comunitat-valenciana',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
}

export default function ComunitatValencianaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
