/**
 * Configuración de los 8 Lead Magnets (Guías por Arquetipo)
 *
 * Cada lead magnet tiene su propia landing page dinámica
 * Rutas: /recursos/[slug]
 */

export type LeadMagnetArchetype =
  | 'ESTRATEGA'
  | 'SISTEMATICO'
  | 'DIFERENCIADOR'
  | 'EJECUTOR'
  | 'RESOLUTOR'
  | 'EXPERIENCIAL'
  | 'EQUILIBRADO'
  | 'IMPROVISADOR'

export interface LeadMagnet {
  slug: string
  archetype: LeadMagnetArchetype
  title: string
  subtitle: string
  description: string
  pages: number
  downloadables: string[]
  cta: string
  color: string // Tailwind color class
  icon: string // Lucide icon name
  testimonial?: {
    author: string
    role: string
    quote: string
    result: string
  }
  preview: {
    chapter1: string
    chapter2: string
    chapter3: string
  }
  benefits: string[]
  downloadUrl: string // Link al PDF (cuando esté disponible)
}

export const LEAD_MAGNETS: Record<LeadMagnetArchetype, LeadMagnet> = {
  ESTRATEGA: {
    slug: 'estratega-5-kpis',
    archetype: 'ESTRATEGA',
    title: 'El Manual del Estratega',
    subtitle: '5 KPIs que Mueven la Aguja',
    description:
      'Deja de mirar métricas vanidosas. Aprende a medir lo que importa y optimiza tu rentabilidad con datos reales.',
    pages: 8,
    downloadables: [
      'Guía PDF (8 páginas)',
      'Template Dashboard Excel',
      'Calculadora de RevPAN',
      'Checklist de KPIs',
    ],
    cta: 'Descarga la guía gratis',
    color: 'blue',
    icon: '🎯',
    testimonial: {
      author: 'Carlos M.',
      role: 'Host con 3 propiedades en Madrid',
      quote:
        'Implementé los 5 KPIs en mi dashboard. En 2 meses aumenté mi RevPAN un 18% sin subir precios. Simplemente optimicé el balance ocupación/precio.',
      result: '+18% RevPAN en 60 días',
    },
    preview: {
      chapter1: 'KPI #1: RevPAN - Tu verdadero rendimiento',
      chapter2: 'KPI #2: Direct Booking Ratio - Tu independencia',
      chapter3: 'KPI #5: Balance Ocupación/ADR - El sweet spot',
    },
    benefits: [
      'Calcula tu RevPAN en 2 minutos',
      'Benchmarks reales del sector',
      'Identifica dónde estás perdiendo dinero',
      'Dashboard listo para copiar-pegar',
      'Entiende si tu precio es correcto',
    ],
    downloadUrl: '/downloads/estratega-5-kpis.pdf',
  },

  SISTEMATICO: {
    slug: 'sistematico-47-tareas',
    archetype: 'SISTEMATICO',
    title: 'El Sistema del Sistemático',
    subtitle: '47 Tareas Automatizables',
    description:
      'De caos a máquina en 30 días. Descubre qué tareas automatizar primero y ahorra 25-30 horas al mes.',
    pages: 10,
    downloadables: [
      'Guía PDF (10 páginas)',
      'Excel con las 47 tareas priorizadas',
      'Template de SOPs (Google Doc)',
      'Checklists imprimibles',
      'Comparativa de herramientas',
    ],
    cta: 'Descarga el sistema completo',
    color: 'purple',
    icon: '⚙️',
    testimonial: {
      author: 'Laura G.',
      role: 'Airbnb Superhost, Barcelona',
      quote:
        'Implementé las 12 tareas P0 en una semana. Ahora paso de 20h semanales gestionando mi apartamento a solo 6h. Y la experiencia del huésped mejoró porque todo es consistente.',
      result: 'De 20h/semana a 6h/semana',
    },
    preview: {
      chapter1: 'Las 12 tareas P0 (automatizar primero)',
      chapter2: 'Checklist de las 47 tareas completas',
      chapter3: 'Stack de herramientas minimalista',
    },
    benefits: [
      'Priorización clara: qué automatizar primero',
      'Templates listos para copiar-pegar',
      '72% de tareas 100% automatizables',
      'ROI: Ahorra 6-8h/semana desde día 1',
      'Stack tech: Solo €65-95/mes',
    ],
    downloadUrl: '/downloads/sistematico-47-tareas.pdf',
  },

  DIFERENCIADOR: {
    slug: 'diferenciador-storytelling',
    archetype: 'DIFERENCIADOR',
    title: 'El Playbook del Diferenciador',
    subtitle: 'Storytelling que Convierte',
    description:
      'Destaca entre 1000+ listings. Aprende a crear una marca memorable que atrae huéspedes ideales y justifica precios premium.',
    pages: 9,
    downloadables: [
      'Guía PDF (9 páginas)',
      'Template de descripción',
      '100 frases de inicio',
      '15 ejemplos analizados',
      'Checklist de storytelling',
    ],
    cta: 'Descarga el playbook',
    color: 'orange',
    icon: '✨',
    testimonial: {
      author: 'Ana R.',
      role: 'Casa rural en Andalucía',
      quote:
        'Reescribí mi descripción usando el framework. En 3 meses mi ocupación pasó de 65% a 89% y pude subir precios 23%. Los huéspedes dicen que "tenían que conocer este lugar".',
      result: 'Ocupación: 65% → 89%',
    },
    preview: {
      chapter1: 'Framework de storytelling (5 pasos)',
      chapter2: '15 descripciones top analizadas',
      chapter3: '31 ideas de experiencias memorables',
    },
    benefits: [
      'Encuentra tu diferenciador único',
      'Escribe descripciones que convierten',
      'Crea experiencias de bajo coste pero alto impacto',
      'Templates de mensajes con personalidad',
      'Caso real: +24% ADR con storytelling',
    ],
    downloadUrl: '/downloads/diferenciador-storytelling.pdf',
  },

  EJECUTOR: {
    slug: 'ejecutor-modo-ceo',
    archetype: 'EJECUTOR',
    title: 'Del Modo Bombero al Modo CEO',
    subtitle: 'Guía del Ejecutor',
    description:
      'Deja de apagar fuegos. Aprende a delegar, priorizar y recuperar tu vida mientras tu negocio crece.',
    pages: 8,
    downloadables: [
      'Guía PDF (8 páginas)',
      'Matriz de Eisenhower aplicada',
      'Template calendario CEO',
      'Checklist de delegación',
      'Lista proveedores confiables',
    ],
    cta: 'Recupera tu tiempo',
    color: 'red',
    icon: '⚡',
    testimonial: {
      author: 'Pedro L.',
      role: '5 apartamentos en Valencia',
      quote:
        'Estaba quemado. Trabajaba 60h/semana y ganaba menos que con un trabajo normal. Apliqué el sistema 80/20 y ahora trabajo 15h/semana con mejor rentabilidad. Delegué el 70%.',
      result: 'De 60h/semana a 15h/semana',
    },
    preview: {
      chapter1: 'Las 5 señales de burnout (test)',
      chapter2: 'Qué delegar primero (priorización)',
      chapter3: 'Plan de balance semanal',
    },
    benefits: [
      'Identifica si estás en burnout',
      'Prioriza con la matriz de Eisenhower',
      'Sabe exactamente qué delegar y a quién',
      'Calendario de CEO (no de operario)',
      'Recupera 15h/semana mínimo',
    ],
    downloadUrl: '/downloads/ejecutor-modo-ceo.pdf',
  },

  RESOLUTOR: {
    slug: 'resolutor-27-crisis',
    archetype: 'RESOLUTOR',
    title: 'Playbook Anti-Crisis',
    subtitle: '27 Situaciones Resueltas',
    description:
      'Convierte tu instinto de resolución en un sistema escalable. Scripts probados para las 27 crisis más comunes.',
    pages: 12,
    downloadables: [
      'Guía PDF (12 páginas)',
      'Scripts para 27 situaciones',
      'Template contactos emergencia',
      'Protocolo de escalación',
      'Kit anti-crisis (checklist)',
    ],
    cta: 'Descarga el playbook',
    color: 'green',
    icon: '🛠️',
    testimonial: {
      author: 'Miguel A.',
      role: '10+ años como host',
      quote:
        'He visto de todo. Esta guía tiene exactamente lo que hubiera necesitado en mis primeros años. Los scripts son oro puro. Ahora los uso con mi equipo y resolvemos el 90% de problemas en <2h.',
      result: '90% problemas resueltos <2h',
    },
    preview: {
      chapter1: '10 crisis menores (solución <2h)',
      chapter2: '10 crisis medias (plan de acción)',
      chapter3: '7 crisis graves (protocolo completo)',
    },
    benefits: [
      'Scripts word-for-word para cada crisis',
      'Protocolos de escalación claros',
      'Contactos de emergencia organizados',
      'Prevención: señales de alerta temprana',
      'Del 80% modo reactivo al 20%',
    ],
    downloadUrl: '/downloads/resolutor-27-crisis.pdf',
  },

  EXPERIENCIAL: {
    slug: 'experiencial-corazon-escalable',
    archetype: 'EXPERIENCIAL',
    title: 'El Corazón Escalable',
    subtitle: 'Automatiza lo Técnico, Amplifica lo Humano',
    description:
      'Tu don es la hospitalidad. Aprende a escalarla sin perder la magia. 31 momentos WOW de bajo coste pero alto impacto.',
    pages: 10,
    downloadables: [
      'Guía PDF (10 páginas)',
      '31 ideas de momentos WOW',
      'Welcome pack ideas (3 niveles)',
      'Sistema de seguimiento emocional',
      'Scripts para situaciones delicadas',
    ],
    cta: 'Descarga la guía',
    color: 'pink',
    icon: '❤️',
    testimonial: {
      author: 'Carmen S.',
      role: 'Boutique guesthouse',
      quote:
        'Mi repeat guest rate era 12%. Implementé 5 de los 31 momentos WOW (total inversión: €8 por reserva). En 6 meses mi repeat rate subió a 38%. Y mi rating pasó de 4.7 a 4.95.',
      result: 'Repeat guests: 12% → 38%',
    },
    preview: {
      chapter1: 'La paradoja: automatizar para humanizar',
      chapter2: '31 momentos WOW categorizados',
      chapter3: 'Sistema de seguimiento sin CRM',
    },
    benefits: [
      '31 ideas probadas (<€5 cada una)',
      'Welcome packs en 3 presupuestos',
      'Cómo recordar preferencias fácilmente',
      'Scripts para conversaciones difíciles',
      'Caso: 42% repeat guests con bajo coste',
    ],
    downloadUrl: '/downloads/experiencial-corazon-escalable.pdf',
  },

  EQUILIBRADO: {
    slug: 'equilibrado-versatil-excepcional',
    archetype: 'EQUILIBRADO',
    title: 'El Equilibrado Estratégico',
    subtitle: 'De Versátil a Excepcional',
    description:
      'Eres bueno en todo, maestro en nada. Descubre cómo mantener tu versatilidad mientras desarrollas tu área de dominio.',
    pages: 8,
    downloadables: [
      'Guía PDF (8 páginas)',
      'Test: Descubre tu ventaja oculta',
      'Plan de especialización 90 días',
      '3 casos de éxito detallados',
      'Worksheet de autoevaluación',
    ],
    cta: 'Encuentra tu ventaja',
    color: 'teal',
    icon: '⚖️',
    testimonial: {
      author: 'Roberto F.',
      role: 'Apartamento urbano',
      quote:
        'Era "okay" en todo. El test reveló que mi spike potencial era pricing. Me enfoqué 90 días solo en eso. Ahora soy top 10% en pricing de mi zona y el resto sigue funcionando.',
      result: 'Top 10% en pricing de su zona',
    },
    preview: {
      chapter1: 'Test: Descubre tu spike potencial',
      chapter2: 'Estrategia de especialización gradual',
      chapter3: '3 casos reales de equilibrados exitosos',
    },
    benefits: [
      'Identifica tu spike (área de dominio)',
      'Sistema T-shaped: profundo en 1, amplio en todas',
      'Plan 90 días con checklist semanal',
      '3 casos inspiradores con resultados',
      'Mantén versatilidad, gana expertiz',
    ],
    downloadUrl: '/downloads/equilibrado-versatil-excepcional.pdf',
  },

  IMPROVISADOR: {
    slug: 'improvisador-kit-anti-caos',
    archetype: 'IMPROVISADOR',
    title: 'El Kit Anti-Caos',
    subtitle: 'Estructura que Libera',
    description:
      'Solo 5 sistemas. Nada más. Mantén tu libertad mientras eliminas el caos crítico que te está costando dinero y sueño.',
    pages: 9,
    downloadables: [
      'Guía PDF (9 páginas)',
      'Los 5 sistemas NO negociables',
      'Framework de rutinas flexibles',
      'Stack tech (máximo 3 apps)',
      'Mini-checklist de bolsillo',
    ],
    cta: 'Descarga el kit',
    color: 'yellow',
    icon: '🎨',
    testimonial: {
      author: 'Martín P.',
      role: '2 propiedades en Barcelona',
      quote:
        'Odio los procesos. Pero los 5 sistemas NO negociables me salvaron. Ahora trabajo 10h/semana, tengo 72% ocupación y 4.9★. El resto lo improviso como siempre. Cero caos crítico.',
      result: '10h/semana + 4.9★ + 72% ocupación',
    },
    preview: {
      chapter1: 'Los 5 sistemas NO negociables',
      chapter2: 'Rutinas flexibles (framework)',
      chapter3: 'Qué NO automatizar (mantén tu magia)',
    },
    benefits: [
      'Solo 5 sistemas (nada más)',
      'Libertad total en todo lo demás',
      'Stack tech: máximo 3 apps',
      'Acepta 5% de caos como "coste de libertad"',
      'Setup completo en 3 semanas',
    ],
    downloadUrl: '/downloads/improvisador-kit-anti-caos.pdf',
  },
}

// Helper para obtener lead magnet por slug (busca en arquetipos y plantillas genéricas)
export function getLeadMagnetBySlug(slug: string): LeadMagnet | GenericTemplate | undefined {
  const archetypeLM = Object.values(LEAD_MAGNETS).find((lm) => lm.slug === slug)
  if (archetypeLM) return archetypeLM

  const genericTemplate = GENERIC_TEMPLATES[slug]
  if (genericTemplate) return genericTemplate

  return undefined
}

// Helper para obtener lead magnet por archetype
export function getLeadMagnetByArchetype(
  archetype: LeadMagnetArchetype
): LeadMagnet {
  return LEAD_MAGNETS[archetype]
}

// Alias para lead magnets por arquetipo (para retrocompatibilidad con emails antiguos)
// Estos redirigen a los PDFs de arquetipos que SÍ existen
interface GenericTemplate extends Omit<LeadMagnet, 'archetype'> {
  archetype?: never
}

export const GENERIC_TEMPLATES: Record<string, GenericTemplate> = {
  'ejecutor-turno-key': {
    slug: 'ejecutor-modo-ceo',
    title: 'Ejecutor: Sistema Turn-Key',
    subtitle: 'De la Visión a la Ejecución Sin Fricción',
    description: 'Sistema completo para ejecutores que quieren implementar rápido y bien.',
    pages: 14,
    downloadables: ['Guía PDF completa', 'Checklist implementación', 'Templates SOPs', 'Timeline 90 días'],
    cta: 'Descargar Guía',
    color: 'red',
    icon: '⚡',
    preview: { chapter1: 'Sistema de ejecución', chapter2: 'Quick wins', chapter3: 'Escalabilidad' },
    benefits: ['Implementación rápida', 'Sistema probado', 'Sin fricción', 'Resultados medibles'],
    downloadUrl: '/downloads/ejecutor-modo-ceo.pdf',
  },
  'improvisador-kit-supervivencia': {
    slug: 'improvisador-kit-anti-caos',
    title: 'Improvisador: Kit de Supervivencia',
    subtitle: 'Del Caos al Control en 30 Días',
    description: 'Sistema de emergencia para improvisadores que necesitan orden ya.',
    pages: 16,
    downloadables: ['Kit completo PDF', 'Sistema 3 niveles', 'Templates urgentes', 'Checklist diario'],
    cta: 'Descargar Kit',
    color: 'yellow',
    icon: '🆘',
    preview: { chapter1: 'Supervivencia (semana 1)', chapter2: 'Estabilidad (semana 2-3)', chapter3: 'Automatización' },
    benefits: ['Control inmediato', 'Sistema simple', 'Sin abrumar', 'Funciona bajo presión'],
    downloadUrl: '/downloads/improvisador-kit-anti-caos.pdf',
  },
  'resolutor-protocolos': {
    slug: 'resolutor-27-crisis',
    title: 'Resolutor: 27 Protocolos de Crisis',
    subtitle: 'De Reactivo a Preventivo',
    description: 'Protocolos completos para las 27 crisis más comunes en alquiler vacacional.',
    pages: 22,
    downloadables: ['27 Protocolos PDF', 'Checklist prevención', 'Templates comunicación', 'Red de proveedores'],
    cta: 'Descargar Protocolos',
    color: 'orange',
    icon: '🚨',
    preview: { chapter1: 'Protocolos emergencias', chapter2: 'Sistema preventivo', chapter3: 'Red de respuesta' },
    benefits: ['27 crisis resueltas', 'Protocolos probados', 'Respuesta rápida', 'Menos estrés'],
    downloadUrl: '/downloads/resolutor-27-crisis.pdf',
  },
  'experiencial-manual-experiencias': {
    slug: 'experiencial-corazon-escalable',
    title: 'Experiencial: Manual de Experiencias',
    subtitle: 'Hospitalidad con Corazón Escalable',
    description: 'Cómo crear experiencias memorables sin perder tu esencia al escalar.',
    pages: 18,
    downloadables: ['Manual completo', '50 touchpoints', 'Sistema de sorpresas', 'Guía de personalización'],
    cta: 'Descargar Manual',
    color: 'pink',
    icon: '❤️',
    preview: { chapter1: 'Experiencias memorables', chapter2: 'Touchpoints clave', chapter3: 'Escalar con corazón' },
    benefits: ['Experiencias únicas', 'Escalable', 'Reviews 5★', 'Diferenciación'],
    downloadUrl: '/downloads/experiencial-corazon-escalable.pdf',
  },
  'equilibrado-startup-kit': {
    slug: 'equilibrado-versatil-excepcional',
    title: 'Equilibrado: Startup Kit',
    subtitle: 'Versatilidad que Se Convierte en Ventaja',
    description: 'Kit completo para equilibrados que quieren destacar siendo versátiles.',
    pages: 15,
    downloadables: ['Startup Kit PDF', 'Framework adaptativo', 'Checklist versatilidad', 'Casos de uso'],
    cta: 'Descargar Kit',
    color: 'teal',
    icon: '⚖️',
    preview: { chapter1: 'Versatilidad estratégica', chapter2: 'Adaptabilidad', chapter3: 'Excelencia balanceada' },
    benefits: ['Versatilidad como ventaja', 'Adaptable', 'Sin especializarse', 'Rápido pivote'],
    downloadUrl: '/downloads/equilibrado-versatil-excepcional.pdf',
  },
}

// Obtener todos los slugs para generación estática
export function getAllLeadMagnetSlugs(): string[] {
  const archetypeSlugs = Object.values(LEAD_MAGNETS).map((lm) => lm.slug)
  const templateSlugs = Object.values(GENERIC_TEMPLATES).map((t) => t.slug)
  return [...archetypeSlugs, ...templateSlugs]
}
