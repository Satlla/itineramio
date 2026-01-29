// Recursos descargables del embudo - landing dinámica reutilizable
// Cada recurso tiene su propia configuración de landing y email

export interface FunnelResource {
  slug: string
  title: string
  subtitle: string
  description: string
  // Lo que reciben
  resourceName: string
  resourceDescription: string
  // Email que se envía
  emailSubject: string
  // URL del PDF o recurso (puede ser null si se genera dinámicamente)
  downloadUrl: string | null
  // Tags para segmentación
  tags: string[]
  // Colores del tema
  theme: {
    primary: string
    gradient: string
  }
}

export const FUNNEL_RESOURCES: Record<string, FunnelResource> = {
  'plantillas-mensajes': {
    slug: 'plantillas-mensajes',
    title: 'Plantillas de Mensajes Automáticos',
    subtitle: 'para Airbnb y Booking',
    description: 'Rellena el formulario y te enviamos gratis las plantillas que usamos nosotros para reducir un 80% los mensajes repetitivos.',
    resourceName: 'Pack de Plantillas de Mensajes',
    resourceDescription: '5 plantillas + respuestas rápidas listas para copiar y pegar',
    emailSubject: '📩 Tus plantillas de mensajes automáticos',
    downloadUrl: '/recursos/descargas/plantillas-mensajes/pdf',
    tags: ['recurso-plantillas-mensajes', 'funnel-time-calculator'],
    theme: {
      primary: '#FF385C',
      gradient: 'from-rose-500 to-orange-500'
    }
  },
  'checklist-checkin': {
    slug: 'checklist-checkin',
    title: 'Checklist de Check-in Perfecto',
    subtitle: 'Sin olvidos, sin estrés',
    description: 'La checklist que usamos para que ningún huésped llegue y falte algo. Descárgala gratis.',
    resourceName: 'Checklist de Check-in',
    resourceDescription: 'PDF imprimible con todo lo que revisar antes de cada llegada',
    emailSubject: '✅ Tu checklist de check-in perfecto',
    downloadUrl: '/downloads/checklist-checkin.pdf',
    tags: ['recurso-checklist-checkin', 'funnel-time-calculator'],
    theme: {
      primary: '#10B981',
      gradient: 'from-emerald-500 to-teal-500'
    }
  },
  'guia-respuestas-rapidas': {
    slug: 'guia-respuestas-rapidas',
    title: 'Guía de Respuestas Rápidas',
    subtitle: 'Configura Airbnb en 10 minutos',
    description: 'Tutorial paso a paso para configurar las respuestas guardadas de Airbnb y ahorrar horas cada mes.',
    resourceName: 'Guía de Respuestas Rápidas',
    resourceDescription: 'PDF con capturas de pantalla y ejemplos reales',
    emailSubject: '⚡ Tu guía de respuestas rápidas para Airbnb',
    downloadUrl: '/downloads/guia-respuestas-rapidas.pdf',
    tags: ['recurso-guia-respuestas', 'funnel-time-calculator'],
    theme: {
      primary: '#3B82F6',
      gradient: 'from-blue-500 to-indigo-500'
    }
  }
}

export function getFunnelResource(slug: string): FunnelResource | null {
  return FUNNEL_RESOURCES[slug] || null
}

export function getAllFunnelResourceSlugs(): string[] {
  return Object.keys(FUNNEL_RESOURCES)
}

// Opciones del formulario (compartidas entre todos los recursos)
export const FORM_OPTIONS = {
  propiedades: [
    { value: '1', label: '1 propiedad' },
    { value: '2-3', label: '2-3 propiedades' },
    { value: '4-5', label: '4-5 propiedades' },
    { value: '6-10', label: '6-10 propiedades' },
    { value: '10+', label: 'Más de 10' }
  ],
  automatizacion: [
    { value: 'nada', label: 'Nada, todo manual' },
    { value: 'basico', label: 'Algo básico (respuestas guardadas, mensajes programados)' },
    { value: 'herramientas', label: 'Sí, uso herramientas/software' }
  ],
  intereses: [
    { id: 'mensajes', label: 'Mensajes repetitivos', icon: '💬' },
    { id: 'checkin', label: 'Coordinar check-in/out', icon: '🔑' },
    { id: 'limpieza', label: 'Gestión de limpieza', icon: '🧹' },
    { id: 'precios', label: 'Ajuste de precios', icon: '💰' },
    { id: 'resenas', label: 'Conseguir reseñas', icon: '⭐' }
  ]
}
