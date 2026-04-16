import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checklist Airbnb: Amenities y Equipamiento por Zonas [2026] | Itineramio',
  description: 'Checklist completo de amenities para tu Airbnb organizado por zonas: entrada, habitación, cocina, baño, salón y terraza. Interactivo y descargable gratis. Lo que necesitas para conseguir 5 estrellas.',
  keywords: [
    'checklist airbnb',
    'amenities airbnb',
    'checklist anfitrion airbnb',
    'equipamiento airbnb',
    'que necesita un airbnb',
    'comodidades airbnb',
    'checklist limpieza airbnb',
    'lista amenities apartamento turistico',
    'checklist superhost',
    'que poner en un airbnb',
    'amenidades airbnb',
    'equipamiento apartamento turistico',
    'checklist host airbnb',
    'imprescindibles airbnb',
    'como equipar un airbnb',
  ],
  openGraph: {
    title: 'Checklist Airbnb: Todo lo que necesita tu alojamiento',
    description: 'Checklist interactivo de amenities por zonas. Marca lo que tienes, descubre lo que te falta. Descarga gratis.',
    images: [{ url: 'https://www.itineramio.com/images/neighbor.png', width: 1920, height: 1080 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Checklist Airbnb: Amenities por Zonas',
    description: 'Lo que necesita tu Airbnb para conseguir 5 estrellas. Interactivo y descargable.',
    images: ['https://www.itineramio.com/images/neighbor.png'],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/checklist-airbnb',
  },
}

export default function ChecklistLayout({ children }: { children: React.ReactNode }) {
  return children
}
