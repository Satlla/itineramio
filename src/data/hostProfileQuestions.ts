export type Dimension =
  | 'HOSPITALIDAD'
  | 'COMUNICACION'
  | 'OPERATIVA'
  | 'CRISIS'
  | 'DATA'
  | 'LIMITES'
  | 'MKT'
  | 'BALANCE'

export type Archetype =
  | 'ESTRATEGA'
  | 'SISTEMATICO'
  | 'DIFERENCIADOR'
  | 'EJECUTOR'
  | 'RESOLUTOR'
  | 'EXPERIENCIAL'
  | 'EQUILIBRADO'
  | 'IMPROVISADOR'

export interface Question {
  id: number
  dimension: Dimension
  text: string
  options: {
    value: number  // 1-5 (1 = Nunca, 5 = Siempre)
    label: string
  }[]
}

export const questions: Question[] = [
  // HOSPITALIDAD (6 preguntas)
  {
    id: 1,
    dimension: 'HOSPITALIDAD',
    text: '¿Con qué frecuencia personalizas la experiencia para cada huésped (detalles de bienvenida, recomendaciones personalizadas)?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 2,
    dimension: 'HOSPITALIDAD',
    text: '¿Ofreces extras o comodidades adicionales sin que te lo pidan (toallas extra, artículos de cortesía, guías locales)?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 3,
    dimension: 'HOSPITALIDAD',
    text: '¿Te anticipas a necesidades del huésped antes de que las mencionen?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 4,
    dimension: 'HOSPITALIDAD',
    text: '¿Respondes a mensajes de huéspedes en menos de 1 hora?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 5,
    dimension: 'HOSPITALIDAD',
    text: '¿Recibes reseñas de 5 estrellas mencionando tu atención al detalle?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 6,
    dimension: 'HOSPITALIDAD',
    text: '¿Haces seguimiento post-checkout para asegurar satisfacción del huésped?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },

  // COMUNICACION (6 preguntas)
  {
    id: 7,
    dimension: 'COMUNICACION',
    text: '¿Proporcionas instrucciones claras y anticipadas antes del check-in (acceso, parking, normas)?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 8,
    dimension: 'COMUNICACION',
    text: '¿Utilizas múltiples canales de comunicación (mensajes, WhatsApp, email) según preferencia del huésped?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 9,
    dimension: 'COMUNICACION',
    text: '¿Adaptas tu tono y estilo de comunicación según el perfil del huésped (familias, profesionales, turistas)?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 10,
    dimension: 'COMUNICACION',
    text: '¿Mantienes a los huéspedes informados sobre eventos locales, clima, o cambios relevantes durante su estancia?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 11,
    dimension: 'COMUNICACION',
    text: '¿Documentas todas las conversaciones importantes con huéspedes para referencia futura?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 12,
    dimension: 'COMUNICACION',
    text: '¿Los huéspedes mencionan en reseñas que tu comunicación fue clara y oportuna?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },

  // OPERATIVA (6 preguntas)
  {
    id: 13,
    dimension: 'OPERATIVA',
    text: '¿Tienes protocolos escritos y documentados para limpieza, check-in, y mantenimiento?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 14,
    dimension: 'OPERATIVA',
    text: '¿Utilizas herramientas digitales para gestionar calendarios, reservas, y tareas (PMS, automatizaciones)?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 15,
    dimension: 'OPERATIVA',
    text: '¿Realizas inspecciones de calidad después de cada limpieza (checklist)?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 16,
    dimension: 'OPERATIVA',
    text: '¿Haces mantenimiento preventivo regular (revisión de electrodomésticos, fontanería, cerraduras)?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 17,
    dimension: 'OPERATIVA',
    text: '¿Tienes proveedores o equipo de respaldo para situaciones de emergencia (limpieza, mantenimiento)?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 18,
    dimension: 'OPERATIVA',
    text: '¿Optimizas tiempos de rotación para maximizar ocupación entre reservas?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },

  // CRISIS (5 preguntas)
  {
    id: 19,
    dimension: 'CRISIS',
    text: '¿Mantienes la calma y actúas con rapidez cuando hay un problema urgente (avería, queja seria)?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 20,
    dimension: 'CRISIS',
    text: '¿Tienes planes de contingencia para situaciones críticas (cancelación de última hora, daños, emergencias)?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 21,
    dimension: 'CRISIS',
    text: '¿Resuelves quejas de huéspedes de manera que terminan satisfechos (mejoras en reseñas después de incidentes)?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 22,
    dimension: 'CRISIS',
    text: '¿Aprendes de cada incidente y actualizas protocolos para evitar repetición?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 23,
    dimension: 'CRISIS',
    text: '¿Tienes red de contactos de emergencia disponibles 24/7 (cerrajero, fontanero, electricista)?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },

  // DATA (5 preguntas)
  {
    id: 24,
    dimension: 'DATA',
    text: '¿Analizas regularmente tus métricas de ocupación, ADR (tarifa promedio), y RevPAR (ingreso por habitación disponible)?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 25,
    dimension: 'DATA',
    text: '¿Utilizas datos para ajustar precios dinámicamente según demanda, temporada, y eventos locales?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 26,
    dimension: 'DATA',
    text: '¿Monitorizas reseñas y ratings de competidores para identificar oportunidades de mejora?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 27,
    dimension: 'DATA',
    text: '¿Llevas registro de costos operativos (limpieza, suministros, mantenimiento) para calcular rentabilidad real?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 28,
    dimension: 'DATA',
    text: '¿Segmentas a tus huéspedes (familias, profesionales, turistas) para personalizar estrategias?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },

  // LIMITES (5 preguntas)
  {
    id: 29,
    dimension: 'LIMITES',
    text: '¿Tienes políticas claras de cancelación y las comunicas desde el principio?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 30,
    dimension: 'LIMITES',
    text: '¿Sabes decir "no" a peticiones que afecten la calidad del servicio o tu rentabilidad?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 31,
    dimension: 'LIMITES',
    text: '¿Aplicas depósitos de seguridad o cargos extra cuando es necesario (daños, huéspedes adicionales)?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 32,
    dimension: 'LIMITES',
    text: '¿Defines y comunicas horarios de check-in/check-out y los respetas?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 33,
    dimension: 'LIMITES',
    text: '¿Estableces expectativas realistas en el anuncio (no prometes más de lo que puedes ofrecer)?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },

  // MKT (6 preguntas)
  {
    id: 34,
    dimension: 'MKT',
    text: '¿Actualizas fotos y descripción de tu anuncio regularmente para reflejar mejoras?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 35,
    dimension: 'MKT',
    text: '¿Destacas características únicas de tu propiedad o ubicación en el anuncio?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 36,
    dimension: 'MKT',
    text: '¿Respondes a todas las reseñas (positivas y negativas) de manera profesional?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 37,
    dimension: 'MKT',
    text: '¿Ofreces promociones o descuentos estratégicos en temporadas bajas?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 38,
    dimension: 'MKT',
    text: '¿Fomentas reseñas positivas de manera proactiva (sin presionar) después del checkout?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 39,
    dimension: 'MKT',
    text: '¿Diversificas canales de distribución (Airbnb, Booking, web propia, reservas directas)?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },

  // BALANCE (6 preguntas)
  {
    id: 40,
    dimension: 'BALANCE',
    text: '¿Delegas tareas operativas (limpieza, mantenimiento, comunicación con huéspedes)?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 41,
    dimension: 'BALANCE',
    text: '¿Automatizas procesos repetitivos (mensajes, recordatorios, reportes)?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 42,
    dimension: 'BALANCE',
    text: '¿Te tomas tiempo libre sin revisar mensajes o gestionar la propiedad constantemente?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 43,
    dimension: 'BALANCE',
    text: '¿Evalúas regularmente si el negocio está creciendo sin comprometer tu bienestar personal?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 44,
    dimension: 'BALANCE',
    text: '¿Tienes sistemas que permiten que tu negocio funcione aunque no estés disponible 24/7?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  },
  {
    id: 45,
    dimension: 'BALANCE',
    text: '¿Inviertes tiempo en aprender y actualizarte sobre tendencias del sector (cursos, comunidades, eventos)?',
    options: [
      { value: 1, label: 'Nunca' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'A veces' },
      { value: 4, label: 'Frecuentemente' },
      { value: 5, label: 'Siempre' }
    ]
  }
]

export const archetypeDescriptions: Record<Archetype, {
  name: string
  tagline: string
  description: string
  strengths: string[]
  risks: string[]
  recommendations: string[]
  color: string
  icon: string
}> = {
  ESTRATEGA: {
    name: 'El Estratega',
    tagline: 'Planificación y visión de negocio',
    description: 'Enfoque analítico y basado en datos. Optimizas precios, segmentas huéspedes, y tomas decisiones informadas. Tu operación es escalable y rentable.',
    strengths: [
      'Análisis de mercado y competencia',
      'Optimización de ingresos (RevPAR, ADR)',
      'Decisiones basadas en datos',
      'Planificación a largo plazo'
    ],
    risks: [
      'Puedes sobre-analizar y retrasar acciones',
      'A veces priorizas números sobre experiencia del huésped'
    ],
    recommendations: [
      'Dedica tiempo a interacciones personales con huéspedes',
      'No olvides el factor humano en la hospitalidad',
      'Balancea análisis con intuición'
    ],
    color: '#3B82F6',
    icon: '🎯'
  },
  SISTEMATICO: {
    name: 'El Sistemático',
    tagline: 'Procesos, eficiencia y automatización',
    description: 'Operación impecable con protocolos claros. Automatizas tareas, tienes checklists, y mantienes estándares altos de forma consistente.',
    strengths: [
      'Protocolos documentados y seguidos',
      'Uso de herramientas digitales (PMS, automatizaciones)',
      'Mantenimiento preventivo regular',
      'Calidad constante en cada reserva'
    ],
    risks: [
      'Puedes ser inflexible ante situaciones únicas',
      'Falta de personalización en la experiencia'
    ],
    recommendations: [
      'Añade toques personales dentro de tus procesos',
      'Permite flexibilidad para casos especiales',
      'No sacrifiques hospitalidad por eficiencia'
    ],
    color: '#8B5CF6',
    icon: '⚙️'
  },
  DIFERENCIADOR: {
    name: 'El Diferenciador',
    tagline: 'Marketing y posicionamiento único',
    description: 'Destacas en un mercado competitivo. Sabes vender tu propuesta de valor, actualizas anuncios, y gestionas reseñas de forma estratégica.',
    strengths: [
      'Anuncios atractivos y actualizados',
      'Buena gestión de reseñas y reputación',
      'Identificación de valor único (ubicación, diseño, servicios)',
      'Diversificación de canales de distribución'
    ],
    risks: [
      'Puedes prometer más de lo que entregas',
      'Enfocarte demasiado en apariencia vs operación real'
    ],
    recommendations: [
      'Asegura que operación esté a la altura del marketing',
      'Invierte en mejoras reales, no solo cosméticas',
      'Mantén expectativas realistas en anuncios'
    ],
    color: '#EC4899',
    icon: '✨'
  },
  EJECUTOR: {
    name: 'El Ejecutor',
    tagline: 'Acción rápida y orientado a resultados',
    description: 'Tomas decisiones rápidas y actúas sin demora. Priorizas ocupación alta, respuestas rápidas, y entregas resultados consistentes.',
    strengths: [
      'Respuesta inmediata a huéspedes',
      'Rotación eficiente entre reservas',
      'Capacidad de manejar múltiples propiedades',
      'Alta ocupación y resultados medibles'
    ],
    risks: [
      'Puedes quemarte por ritmo acelerado',
      'Falta de atención al detalle por rapidez'
    ],
    recommendations: [
      'Implementa sistemas para evitar burnout',
      'Delega tareas operativas',
      'No sacrifiques calidad por velocidad'
    ],
    color: '#F59E0B',
    icon: '⚡'
  },
  RESOLUTOR: {
    name: 'El Resolutor',
    tagline: 'Gestión de crisis y solución de problemas',
    description: 'Mantienes la calma bajo presión y resuelves problemas eficazmente. Tienes planes de contingencia y conviertes quejas en oportunidades.',
    strengths: [
      'Gestión de emergencias 24/7',
      'Resolución de quejas que mejoran reseñas',
      'Red de contactos de respaldo',
      'Aprendizaje continuo de incidentes'
    ],
    risks: [
      'Operas en modo reactivo constantemente',
      'No inviertes suficiente en prevención'
    ],
    recommendations: [
      'Implementa más mantenimiento preventivo',
      'Documenta y sistematiza soluciones comunes',
      'Reduce necesidad de "apagar fuegos"'
    ],
    color: '#EF4444',
    icon: '🛡️'
  },
  EXPERIENCIAL: {
    name: 'El Experiencial',
    tagline: 'Hospitalidad excepcional y atención al huésped',
    description: 'Tu prioridad es la experiencia del huésped. Personalizas cada estancia, anticipas necesidades, y recibes reseñas destacando tu atención.',
    strengths: [
      'Detalles personalizados para cada huésped',
      'Comunicación cálida y cercana',
      'Reseñas de 5 estrellas consistentes',
      'Huéspedes recurrentes y recomendaciones'
    ],
    risks: [
      'Puedes descuidar rentabilidad por complacer',
      'Difícil de escalar sin perder calidad'
    ],
    recommendations: [
      'Define límites claros (precios, políticas)',
      'Sistematiza toques personales para escalar',
      'Balancea hospitalidad con sostenibilidad financiera'
    ],
    color: '#10B981',
    icon: '❤️'
  },
  EQUILIBRADO: {
    name: 'El Equilibrado',
    tagline: 'Balance entre operación, rentabilidad y bienestar',
    description: 'Gestionas tu negocio de manera sostenible. Delegas, automatizas, y mantienes calidad sin comprometer tu bienestar personal.',
    strengths: [
      'Delegación efectiva de tareas',
      'Automatización de procesos',
      'Tiempo libre sin comprometer operación',
      'Crecimiento sostenible'
    ],
    risks: [
      'Puedes ser muy conservador y perder oportunidades',
      'A veces evitas tomar riesgos necesarios'
    ],
    recommendations: [
      'Considera expandir de forma estratégica',
      'Experimenta con nuevas estrategias',
      'No te conformes, busca mejora continua'
    ],
    color: '#06B6D4',
    icon: '⚖️'
  },
  IMPROVISADOR: {
    name: 'El Improvisador',
    tagline: 'Flexibilidad y adaptación sobre la marcha',
    description: 'Te adaptas rápidamente a cualquier situación. Funcionas bien bajo presión pero careces de estructura formal y planificación.',
    strengths: [
      'Alta adaptabilidad',
      'Creatividad para resolver problemas únicos',
      'Buena relación con huéspedes espontánea'
    ],
    risks: [
      'Falta de procesos claros',
      'Inconsistencia en calidad',
      'Estrés por falta de planificación'
    ],
    recommendations: [
      'Documenta procesos básicos (limpieza, check-in)',
      'Usa herramientas digitales para organización',
      'Invierte en planificación y prevención'
    ],
    color: '#A855F7',
    icon: '🎲'
  }
}

export const dimensionLabels: Record<Dimension, string> = {
  HOSPITALIDAD: 'Hospitalidad',
  COMUNICACION: 'Comunicación',
  OPERATIVA: 'Operativa',
  CRISIS: 'Gestión de Crisis',
  DATA: 'Análisis de Datos',
  LIMITES: 'Límites y Políticas',
  MKT: 'Marketing',
  BALANCE: 'Balance Vida-Negocio'
}
