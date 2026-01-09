/**
 * Configuración de Lead Magnets y Embudos por Temática
 *
 * Cada lead magnet tiene asociado un embudo de emails
 * Los leads pueden entrar por:
 * 1. Formulario del lead magnet en la web
 * 2. Alta manual desde el admin (leads de Facebook, etc.)
 */

export type FunnelTheme =
  | 'reservas'
  | 'gestion-huespedes'
  | 'limpieza'
  | 'precios'
  | 'resenas'

export interface LeadMagnetConfig {
  id: FunnelTheme
  name: string
  title: string
  subtitle: string
  description: string
  icon: string
  color: string
  downloadUrl?: string
  resourceUrl?: string // URL del recurso interactivo si existe
  funnelId: string
}

export interface FunnelEmail {
  day: number
  subject: string
  previewText: string
  templateName: string
  blogUrl?: string // Enlace a artículo del blog relacionado
}

export interface FunnelConfig {
  id: string
  theme: FunnelTheme
  name: string
  description: string
  emails: FunnelEmail[]
}

// ============================================
// LEAD MAGNETS
// ============================================

export const LEAD_MAGNETS_BY_THEME: Record<FunnelTheme, LeadMagnetConfig> = {
  'reservas': {
    id: 'reservas',
    name: 'Guía Más Reservas',
    title: '7 Formas de Conseguir Más Reservas',
    subtitle: 'Sin bajar precios ni depender de Airbnb',
    description: 'Descubre las estrategias que usan los Superhosts para tener su calendario lleno todo el año.',
    icon: '📈',
    color: 'emerald',
    downloadUrl: '/downloads/guia-mas-reservas.pdf',
    funnelId: 'funnel-reservas'
  },
  'gestion-huespedes': {
    id: 'gestion-huespedes',
    name: 'Kit de Mensajes',
    title: 'Kit de Mensajes Predefinidos',
    subtitle: '25 templates listos para copiar y pegar',
    description: 'Ahorra horas cada semana con mensajes profesionales para cada situación: check-in, check-out, problemas, reseñas...',
    icon: '💬',
    color: 'blue',
    downloadUrl: '/downloads/kit-mensajes-anfitrion.pdf',
    funnelId: 'funnel-gestion-huespedes'
  },
  'limpieza': {
    id: 'limpieza',
    name: 'Checklist Limpieza',
    title: 'Checklist de Limpieza Profesional',
    subtitle: 'El mismo que usan los hoteles 5 estrellas',
    description: 'Checklist completo y personalizable para que tu equipo de limpieza no se deje nada.',
    icon: '✨',
    color: 'green',
    resourceUrl: '/hub/tools/cleaning-checklist',
    funnelId: 'funnel-limpieza'
  },
  'precios': {
    id: 'precios',
    name: 'Guía de Pricing',
    title: 'Guía de Pricing Inteligente',
    subtitle: 'Cómo calcular tu precio óptimo',
    description: 'Aprende a fijar precios que maximicen tu ocupación Y tu rentabilidad. Con ejemplos reales.',
    icon: '💰',
    color: 'amber',
    downloadUrl: '/downloads/guia-pricing-inteligente.pdf',
    funnelId: 'funnel-precios'
  },
  'resenas': {
    id: 'resenas',
    name: 'Plantilla de Reviews',
    title: 'Plantilla de Reviews para Huéspedes',
    subtitle: 'Educa a tus huéspedes sobre las valoraciones',
    description: 'PDF personalizado que explica el significado de las estrellas + QR de WhatsApp para contacto directo.',
    icon: '⭐',
    color: 'rose',
    resourceUrl: '/recursos/plantilla-estrellas-personalizada',
    funnelId: 'funnel-resenas'
  }
}

// ============================================
// EMBUDOS DE EMAIL
// ============================================

export const FUNNELS: Record<string, FunnelConfig> = {
  'funnel-reservas': {
    id: 'funnel-reservas',
    theme: 'reservas',
    name: 'Embudo: Más Reservas',
    description: 'Secuencia para hosts que quieren aumentar sus reservas',
    emails: [
      {
        day: 0,
        subject: 'Tu guía para conseguir más reservas',
        previewText: 'Descarga tu guía + el error #1 que cometen los anfitriones',
        templateName: 'funnel-reservas-day0'
      },
      {
        day: 2,
        subject: 'El título que multiplica clics (con ejemplos)',
        previewText: 'Cómo escribir títulos que destacan en Airbnb',
        templateName: 'funnel-reservas-day2',
        blogUrl: '/blog/como-escribir-titulo-airbnb-ejemplos'
      },
      {
        day: 4,
        subject: 'Tus fotos están ahuyentando reservas',
        previewText: '5 errores de fotografía que bajan tu conversión',
        templateName: 'funnel-reservas-day4',
        blogUrl: '/blog/fotos-airbnb-errores-comunes'
      },
      {
        day: 7,
        subject: 'La estrategia de precios que usan los Superhosts',
        previewText: 'No es bajar precios, es esto otro...',
        templateName: 'funnel-reservas-day7',
        blogUrl: '/blog/estrategia-precios-superhosts'
      },
      {
        day: 10,
        subject: '¿Tienes 10 minutos para automatizar tu negocio?',
        previewText: 'Crea tu manual digital y deja de responder las mismas preguntas',
        templateName: 'funnel-reservas-day10'
      }
    ]
  },

  'funnel-gestion-huespedes': {
    id: 'funnel-gestion-huespedes',
    theme: 'gestion-huespedes',
    name: 'Embudo: Gestión de Huéspedes',
    description: 'Secuencia para hosts que quieren automatizar comunicación',
    emails: [
      {
        day: 0,
        subject: 'Tu kit de mensajes predefinidos',
        previewText: '25 templates listos para usar desde hoy',
        templateName: 'funnel-gestion-day0'
      },
      {
        day: 2,
        subject: 'Las 5 preguntas que recibes una y otra vez',
        previewText: 'Y cómo dejar de responderlas para siempre',
        templateName: 'funnel-gestion-day2',
        blogUrl: '/blog/preguntas-frecuentes-huespedes-airbnb'
      },
      {
        day: 4,
        subject: 'El mensaje de check-in perfecto',
        previewText: 'Template + timing exacto para enviarlo',
        templateName: 'funnel-gestion-day4',
        blogUrl: '/blog/mensaje-checkin-perfecto-airbnb'
      },
      {
        day: 7,
        subject: 'Cómo manejar huéspedes difíciles (sin perder los nervios)',
        previewText: 'Scripts para las situaciones más incómodas',
        templateName: 'funnel-gestion-day7',
        blogUrl: '/blog/manejar-huespedes-dificiles'
      },
      {
        day: 10,
        subject: 'Automatiza el 80% de tus mensajes',
        previewText: 'Manual digital + mensajes automáticos = libertad',
        templateName: 'funnel-gestion-day10'
      }
    ]
  },

  'funnel-limpieza': {
    id: 'funnel-limpieza',
    theme: 'limpieza',
    name: 'Embudo: Limpieza y Mantenimiento',
    description: 'Secuencia para hosts que quieren optimizar limpieza',
    emails: [
      {
        day: 0,
        subject: 'Tu checklist de limpieza profesional',
        previewText: 'Descárgalo y personalízalo para tu equipo',
        templateName: 'funnel-limpieza-day0'
      },
      {
        day: 2,
        subject: 'El protocolo de limpieza de los hoteles 5 estrellas',
        previewText: 'Adaptado para alquileres vacacionales',
        templateName: 'funnel-limpieza-day2',
        blogUrl: '/blog/protocolo-limpieza-profesional'
      },
      {
        day: 4,
        subject: 'Cómo encontrar (y mantener) buenos limpiadores',
        previewText: 'La guía que hubiera querido tener hace 3 años',
        templateName: 'funnel-limpieza-day4',
        blogUrl: '/blog/encontrar-limpiadores-confianza'
      },
      {
        day: 7,
        subject: 'Mantenimiento preventivo: evita el 90% de emergencias',
        previewText: 'Checklist trimestral que te ahorrará disgustos',
        templateName: 'funnel-limpieza-day7',
        blogUrl: '/blog/mantenimiento-preventivo-alquiler-vacacional'
      },
      {
        day: 10,
        subject: 'Digitaliza tu gestión de limpieza',
        previewText: 'Coordina a tu equipo sin llamadas ni WhatsApps',
        templateName: 'funnel-limpieza-day10'
      }
    ]
  },

  'funnel-precios': {
    id: 'funnel-precios',
    theme: 'precios',
    name: 'Embudo: Precios y Rentabilidad',
    description: 'Secuencia para hosts que quieren optimizar ingresos',
    emails: [
      {
        day: 0,
        subject: 'Tu guía de pricing inteligente',
        previewText: 'Cómo calcular tu precio óptimo (con fórmula)',
        templateName: 'funnel-precios-day0'
      },
      {
        day: 2,
        subject: 'El precio mínimo que deberías cobrar',
        previewText: 'Si cobras menos, estás perdiendo dinero',
        templateName: 'funnel-precios-day2',
        blogUrl: '/blog/calcular-precio-minimo-airbnb'
      },
      {
        day: 4,
        subject: 'Pricing dinámico: la diferencia entre 60% y 85% ocupación',
        previewText: 'Cómo ajustar precios según demanda',
        templateName: 'funnel-precios-day4',
        blogUrl: '/blog/pricing-dinamico-airbnb'
      },
      {
        day: 7,
        subject: 'Los gastos ocultos que están comiendo tu margen',
        previewText: 'Análisis real de costes de un alquiler vacacional',
        templateName: 'funnel-precios-day7',
        blogUrl: '/blog/gastos-ocultos-alquiler-vacacional'
      },
      {
        day: 10,
        subject: '¿Sabes cuánto ganas por hora trabajada?',
        previewText: 'La métrica que cambiará tu forma de ver el negocio',
        templateName: 'funnel-precios-day10'
      }
    ]
  },

  'funnel-resenas': {
    id: 'funnel-resenas',
    theme: 'resenas',
    name: 'Embudo: Reseñas',
    description: 'Secuencia para hosts que quieren mejorar sus valoraciones',
    emails: [
      {
        day: 0,
        subject: 'Tu plantilla de reviews personalizada',
        previewText: 'Educa a tus huéspedes sobre las valoraciones',
        templateName: 'funnel-resenas-day0'
      },
      {
        day: 2,
        subject: 'Por qué te ponen 4 estrellas cuando todo fue "perfecto"',
        previewText: 'El malentendido que arruina valoraciones',
        templateName: 'funnel-resenas-day2',
        blogUrl: '/blog/por-que-4-estrellas-airbnb'
      },
      {
        day: 4,
        subject: 'El momento exacto para pedir una reseña',
        previewText: 'Timing + mensaje que funciona',
        templateName: 'funnel-resenas-day4',
        blogUrl: '/blog/cuando-pedir-resena-airbnb'
      },
      {
        day: 7,
        subject: 'Cómo responder a una reseña negativa (sin empeorarla)',
        previewText: 'Templates + ejemplos reales',
        templateName: 'funnel-resenas-day7',
        blogUrl: '/blog/responder-resenas-negativas-airbnb'
      },
      {
        day: 10,
        subject: 'De 4.2 a 4.8 estrellas: caso de estudio',
        previewText: 'Cómo María mejoró su rating en 3 meses',
        templateName: 'funnel-resenas-day10'
      }
    ]
  }
}

// Helper functions
export function getLeadMagnetByTheme(theme: FunnelTheme): LeadMagnetConfig {
  return LEAD_MAGNETS_BY_THEME[theme]
}

export function getFunnelByTheme(theme: FunnelTheme): FunnelConfig {
  const leadMagnet = LEAD_MAGNETS_BY_THEME[theme]
  return FUNNELS[leadMagnet.funnelId]
}

export function getAllThemes(): FunnelTheme[] {
  return Object.keys(LEAD_MAGNETS_BY_THEME) as FunnelTheme[]
}

export function getThemeLabel(theme: FunnelTheme): string {
  const labels: Record<FunnelTheme, string> = {
    'reservas': 'Conseguir más reservas',
    'gestion-huespedes': 'Gestión de huéspedes',
    'limpieza': 'Limpieza y mantenimiento',
    'precios': 'Precios y rentabilidad',
    'resenas': 'Reseñas'
  }
  return labels[theme]
}
