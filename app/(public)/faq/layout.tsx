import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes sobre Manuales Digitales para Apartamentos | Itineramio',
  description: 'Resuelve todas tus dudas sobre Itineramio: cómo funciona, precios, acceso de huéspedes, compatibilidad con Airbnb y Booking, y prueba gratis. Soporte en español.',
  keywords: [
    'faq itineramio',
    'preguntas frecuentes manuales digitales',
    'como funciona itineramio',
    'dudas manual digital apartamento',
    'precio itineramio',
    'ayuda manual digital airbnb',
    'soporte anfitriones apartamento',
    'guia usuario apartamento turistico',
    'itineramio gratis cuanto cuesta',
    'preguntas frecuentes airbnb gestion'
  ],
  openGraph: {
    title: 'Preguntas Frecuentes — Itineramio | Software para Apartamentos',
    description: 'Encuentra respuestas sobre cómo funciona Itineramio, precios, acceso de huéspedes y compatibilidad con Airbnb y Booking.',
    type: 'website',
    url: 'https://www.itineramio.com/faq',
    images: [
      {
        url: 'https://www.itineramio.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Preguntas frecuentes Itineramio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ - Preguntas Frecuentes | Itineramio',
    description: 'Resuelve tus dudas sobre manuales digitales para apartamentos turísticos.',
    images: ['https://www.itineramio.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.itineramio.com/faq',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona Itineramio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Itineramio te permite crear manuales digitales para tus apartamentos turísticos en minutos. Organizas la información por zonas (WiFi, cocina, baño, etc.), generas códigos QR únicos para cada zona, y tus huéspedes acceden a toda la información desde su móvil sin necesidad de llamarte.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta Itineramio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los planes empiezan desde €9/mes para hasta 2 propiedades. Ofrecemos 4 planes: Basic (€9/mes, 2 propiedades), Host (€29/mes, 10 propiedades), Superhost (€69/mes, 25 propiedades) y Business (€99/mes, 50 propiedades). La primera propiedad es gratis para siempre.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito conocimientos técnicos para usar Itineramio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, Itineramio está diseñado para ser súper fácil de usar. Si sabes usar WhatsApp, sabes usar Itineramio. Solo necesitas rellenar un formulario y añadir las instrucciones de tu apartamento. Tardarás menos de 10 minutos en crear tu primera guía.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo acceden los huéspedes al manual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los huéspedes acceden al manual escaneando un código QR con su móvil. Puedes imprimir códigos QR generales o específicos por zona (uno para WiFi, otro para la cocina, etc.). También puedes enviar el link directo por WhatsApp o email.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo probar Itineramio gratis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, la primera propiedad es gratis para siempre. Puedes crear una cuenta sin tarjeta de crédito, crear tu primera guía digital y probarla con tus huéspedes. Si te gusta y quieres añadir más propiedades, simplemente elige el plan que necesites.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Funciona con Airbnb, Booking u otras plataformas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, Itineramio funciona con cualquier plataforma de alquiler turístico. No importa si usas Airbnb, Booking, Vrbo o tu propia web. El manual digital es tuyo y puedes compartirlo con tus huéspedes de la manera que prefieras.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los manuales están disponibles en varios idiomas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, Itineramio traduce automáticamente el contenido de tus manuales a más de 10 idiomas: español, inglés, francés, alemán, italiano, portugués y más. Tus huéspedes internacionales verán el manual en su idioma sin que tú tengas que hacer nada.',
      },
    },
  ],
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  )
}
