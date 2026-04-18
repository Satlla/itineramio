import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Como Reducir Llamadas de Huespedes | Itineramio',
  description: 'Guia practica para reducir mensajes y llamadas repetitivas de huespedes en tu alquiler vacacional. 7 pasos accionables.',
  keywords: [
    'reducir llamadas huespedes airbnb',
    'menos mensajes huespedes',
    'automatizar comunicacion huespedes',
    'preguntas repetitivas airbnb',
    'manual digital huespedes',
    'como dejar de responder wifi airbnb',
    'guia digital apartamento turistico',
  ],
  openGraph: {
    title: 'Como Reducir Llamadas de Huespedes | Itineramio',
    description: 'Guia practica para reducir mensajes y llamadas repetitivas de huespedes. 7 pasos accionables.',
    url: 'https://www.itineramio.com/guia/como-reducir-llamadas-huespedes',
    siteName: 'Itineramio',
    locale: 'es_ES',
    type: 'article',
  },
  alternates: {
    canonical: 'https://www.itineramio.com/guia/como-reducir-llamadas-huespedes',
  },
}

export default function GuiaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
