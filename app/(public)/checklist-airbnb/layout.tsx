import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checklist Amenities Alojamiento Turístico | Itineramio',
  description: 'Checklist de compras por zonas para tu alojamiento turístico: cocina, baño, dormitorio y limpieza. Interactivo y descargable gratis.',
  keywords: [
    'checklist alojamiento turistico',
    'checklist airbnb',
    'amenities airbnb',
    'equipamiento apartamento turistico',
    'que necesita un alojamiento turistico',
    'lista compras apartamento vacacional',
    'checklist anfitrion',
    'como equipar un apartamento turistico',
    'guia digital apartamento turistico',
    'manual digital alojamiento',
    'checklist superhost',
    'amenidades alojamiento',
    'imprescindibles apartamento turistico',
  ],
  openGraph: {
    title: 'Checklist de compras para tu alojamiento turístico',
    description: 'Todo lo que necesitas comprar para tu alojamiento. Interactivo, personalizable y descargable.',
    images: [{ url: 'https://www.itineramio.com/images/neighbor.png', width: 1920, height: 1080 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Checklist de compras para tu alojamiento',
    description: 'Lo que necesita tu apartamento turístico. Interactivo y descargable.',
    images: ['https://www.itineramio.com/images/neighbor.png'],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/checklist-airbnb',
  },
}

export default function ChecklistLayout({ children }: { children: React.ReactNode }) {
  return children
}
