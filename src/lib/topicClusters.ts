// ─── Topic Clusters: Mapa completo de contenido para blog de alquiler vacacional ───
// 8 pilares × 10-15 clusters = ~100 artículos planificados
// Cada artículo tiene keyword principal, intención de búsqueda y prioridad

export type SearchIntent = 'informational' | 'transactional' | 'comparison' | 'navigational'
export type ArticlePriority = 1 | 2 | 3 // 1 = urgente, 2 = importante, 3 = nice-to-have
export type ArticleType = 'pillar' | 'cluster'

export interface ClusterArticle {
  title: string
  slug: string
  keyword: string
  secondaryKeywords: string[]
  intent: SearchIntent
  priority: ArticlePriority
  type: ArticleType
  category: BlogCategory
  estimatedWords: number
  faqTopics: string[]       // Preguntas frecuentes a incluir para featured snippets
  leadMagnet?: string       // Recurso descargable sugerido
}

export interface TopicCluster {
  id: string
  pillarTitle: string
  pillarSlug: string
  primaryKeyword: string
  secondaryKeywords: string[]
  description: string
  category: BlogCategory
  articles: ClusterArticle[]
}

export type BlogCategory =
  | 'GUIAS'
  | 'MEJORES_PRACTICAS'
  | 'NORMATIVA'
  | 'AUTOMATIZACION'
  | 'MARKETING'
  | 'OPERACIONES'
  | 'CASOS_ESTUDIO'
  | 'NOTICIAS'

// ─── Los 8 pilares ───────────────────────────────────────────────────────────

export const TOPIC_CLUSTERS: TopicCluster[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // PILAR 1: GESTIÓN DE ALQUILER VACACIONAL
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'gestion',
    pillarTitle: 'Gestión de Alquiler Vacacional: La Guía Definitiva 2026',
    pillarSlug: 'gestion-alquiler-vacacional-guia-completa',
    primaryKeyword: 'gestión alquiler vacacional',
    secondaryKeywords: ['administración apartamento turístico', 'gestionar vivienda turística', 'property management vacacional'],
    description: 'Todo lo que necesitas saber para gestionar un alquiler vacacional de forma profesional',
    category: 'GUIAS',
    articles: [
      {
        title: 'Gestión de Alquiler Vacacional: La Guía Definitiva 2026',
        slug: 'gestion-alquiler-vacacional-guia-completa',
        keyword: 'gestión alquiler vacacional',
        secondaryKeywords: ['cómo gestionar apartamento turístico', 'administrar vivienda vacacional'],
        intent: 'informational',
        priority: 1,
        type: 'pillar',
        category: 'GUIAS',
        estimatedWords: 5000,
        faqTopics: [
          '¿Cuánto cuesta gestionar un alquiler vacacional?',
          '¿Necesito una empresa de gestión o puedo hacerlo yo?',
          '¿Cuántas horas semanales requiere gestionar un apartamento turístico?',
          '¿Qué herramientas necesito para empezar?',
        ],
        leadMagnet: 'Checklist completo de gestión de alquiler vacacional (PDF)',
      },
      {
        title: 'Cerraduras Inteligentes para Apartamentos Turísticos: Guía Comparativa 2026',
        slug: 'cerraduras-inteligentes-apartamentos-turisticos',
        keyword: 'cerraduras inteligentes apartamento turístico',
        secondaryKeywords: ['smart lock airbnb', 'cerradura electrónica alquiler vacacional', 'nuki vs yale vs ttlock'],
        intent: 'comparison',
        priority: 1,
        type: 'cluster',
        category: 'GUIAS',
        estimatedWords: 3000,
        faqTopics: [
          '¿Qué cerradura inteligente es mejor para Airbnb?',
          '¿Se puede instalar una cerradura inteligente sin cambiar la puerta?',
          '¿Cuánto cuesta una cerradura inteligente para apartamento turístico?',
        ],
        leadMagnet: 'Tabla comparativa de cerraduras inteligentes (PDF)',
      },
      {
        title: 'Cómo Organizar la Limpieza de tu Apartamento Turístico entre Huéspedes',
        slug: 'organizar-limpieza-apartamento-turistico',
        keyword: 'limpieza apartamento turístico',
        secondaryKeywords: ['turnos limpieza airbnb', 'checklist limpieza alquiler vacacional', 'empresa limpieza turístico'],
        intent: 'informational',
        priority: 1,
        type: 'cluster',
        category: 'OPERACIONES',
        estimatedWords: 2500,
        faqTopics: [
          '¿Cuánto cuesta la limpieza de un apartamento turístico?',
          '¿Cuánto tiempo se necesita para limpiar un apartamento entre huéspedes?',
          '¿Es mejor contratar empresa o limpiador autónomo?',
        ],
        leadMagnet: 'Checklist de limpieza descargable (PDF)',
      },
      {
        title: 'Comunicación con Huéspedes: Plantillas y Mensajes Automáticos para Airbnb',
        slug: 'comunicacion-huespedes-plantillas-mensajes-automaticos',
        keyword: 'mensajes automáticos airbnb',
        secondaryKeywords: ['plantillas mensajes huéspedes', 'comunicación automática booking', 'respuestas automáticas alquiler vacacional'],
        intent: 'transactional',
        priority: 1,
        type: 'cluster',
        category: 'AUTOMATIZACION',
        estimatedWords: 2500,
        faqTopics: [
          '¿Qué mensajes enviar antes del check-in?',
          '¿Cómo automatizar mensajes en Airbnb?',
          '¿Cuántos mensajes debo enviar a cada huésped?',
        ],
        leadMagnet: 'Pack de 15 plantillas de mensajes para huéspedes (PDF)',
      },
      {
        title: 'Cómo Gestionar Incidencias y Reclamaciones en tu Alquiler Vacacional',
        slug: 'gestionar-incidencias-reclamaciones-alquiler-vacacional',
        keyword: 'incidencias alquiler vacacional',
        secondaryKeywords: ['reclamaciones huéspedes airbnb', 'problemas apartamento turístico', 'gestión conflictos alquiler'],
        intent: 'informational',
        priority: 2,
        type: 'cluster',
        category: 'OPERACIONES',
        estimatedWords: 2000,
        faqTopics: [
          '¿Qué hacer si un huésped rompe algo?',
          '¿Cómo reclamar daños a Airbnb?',
          '¿Necesito un seguro para alquiler turístico?',
        ],
      },
      {
        title: 'Mantenimiento Preventivo para Apartamentos Turísticos: Calendario Anual',
        slug: 'mantenimiento-preventivo-apartamento-turistico',
        keyword: 'mantenimiento apartamento turístico',
        secondaryKeywords: ['calendario mantenimiento vivienda turística', 'reparaciones alquiler vacacional'],
        intent: 'informational',
        priority: 2,
        type: 'cluster',
        category: 'OPERACIONES',
        estimatedWords: 2000,
        faqTopics: [
          '¿Cada cuánto hay que revisar las instalaciones?',
          '¿Qué elementos se deterioran más en un apartamento turístico?',
        ],
        leadMagnet: 'Calendario de mantenimiento anual (Excel)',
      },
      {
        title: 'Seguros para Alquiler Vacacional: Qué Cubren y Cuál Elegir',
        slug: 'seguros-alquiler-vacacional-comparativa',
        keyword: 'seguro alquiler vacacional',
        secondaryKeywords: ['seguro apartamento turístico', 'seguro vivienda turística', 'aircover vs seguro privado'],
        intent: 'comparison',
        priority: 2,
        type: 'cluster',
        category: 'GUIAS',
        estimatedWords: 2500,
        faqTopics: [
          '¿Es obligatorio tener seguro para alquiler turístico?',
          '¿Qué cubre AirCover de Airbnb?',
          '¿Cuánto cuesta un seguro de alquiler vacacional?',
        ],
      },
      {
        title: 'Cómo Elegir el Mejor Channel Manager para tu Alquiler Vacacional',
        slug: 'mejor-channel-manager-alquiler-vacacional',
        keyword: 'channel manager alquiler vacacional',
        secondaryKeywords: ['comparativa channel manager', 'smoobu vs lodgify vs hostaway', 'gestor de canales apartamento turístico'],
        intent: 'comparison',
        priority: 1,
        type: 'cluster',
        category: 'AUTOMATIZACION',
        estimatedWords: 3000,
        faqTopics: [
          '¿Qué es un channel manager?',
          '¿Merece la pena pagar un channel manager?',
          '¿Cuál es el channel manager más barato?',
        ],
        leadMagnet: 'Tabla comparativa de channel managers 2026 (PDF)',
      },
      {
        title: 'Cómo Calcular la Rentabilidad de tu Alquiler Vacacional',
        slug: 'calcular-rentabilidad-alquiler-vacacional',
        keyword: 'rentabilidad alquiler vacacional',
        secondaryKeywords: ['roi alquiler turístico', 'beneficio apartamento turístico', 'cuánto se gana con airbnb'],
        intent: 'transactional',
        priority: 1,
        type: 'cluster',
        category: 'GUIAS',
        estimatedWords: 2500,
        faqTopics: [
          '¿Cuánto se gana con un apartamento turístico en España?',
          '¿Es rentable el alquiler vacacional en 2026?',
          '¿Cómo calcular el ROI de mi alquiler turístico?',
        ],
        leadMagnet: 'Calculadora de rentabilidad (Excel)',
      },
      {
        title: 'Gestión Remota de Apartamentos Turísticos: Guía Práctica',
        slug: 'gestion-remota-apartamentos-turisticos',
        keyword: 'gestión remota apartamento turístico',
        secondaryKeywords: ['gestionar airbnb a distancia', 'alquiler vacacional sin estar presente'],
        intent: 'informational',
        priority: 2,
        type: 'cluster',
        category: 'GUIAS',
        estimatedWords: 2000,
        faqTopics: [
          '¿Se puede gestionar un Airbnb sin vivir en la misma ciudad?',
          '¿Qué herramientas necesito para gestión remota?',
        ],
      },
      {
        title: 'Property Manager vs Autogestión: ¿Qué te Conviene Más?',
        slug: 'property-manager-vs-autogestion-alquiler-vacacional',
        keyword: 'property manager alquiler vacacional',
        secondaryKeywords: ['empresa gestión apartamentos turísticos', 'gestora viviendas turísticas', 'comisión property manager'],
        intent: 'comparison',
        priority: 2,
        type: 'cluster',
        category: 'GUIAS',
        estimatedWords: 2500,
        faqTopics: [
          '¿Cuánto cobra un property manager?',
          '¿Merece la pena contratar una gestora?',
          '¿Qué incluye el servicio de un property manager?',
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PILAR 2: NORMATIVA Y LEGISLACIÓN VUT
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'normativa',
    pillarTitle: 'Normativa de Vivienda de Uso Turístico (VUT) en España: Guía por Comunidad Autónoma',
    pillarSlug: 'normativa-vut-espana-comunidades-autonomas',
    primaryKeyword: 'normativa VUT España',
    secondaryKeywords: ['legislación alquiler turístico', 'ley vivienda turística', 'regulación apartamento turístico'],
    description: 'Toda la legislación de viviendas de uso turístico por comunidad autónoma, actualizada',
    category: 'NORMATIVA',
    articles: [
      {
        title: 'Normativa VUT en España: Guía Completa por Comunidad Autónoma 2026',
        slug: 'normativa-vut-espana-comunidades-autonomas',
        keyword: 'normativa VUT España',
        secondaryKeywords: ['ley vivienda turística españa', 'regulación alquiler turístico por comunidad'],
        intent: 'informational',
        priority: 1,
        type: 'pillar',
        category: 'NORMATIVA',
        estimatedWords: 6000,
        faqTopics: [
          '¿Qué es una VUT?',
          '¿Necesito licencia para alquilar mi piso como turístico?',
          '¿Qué pasa si alquilo sin licencia turística?',
          '¿Cuánto tarda en conseguirse una licencia turística?',
        ],
        leadMagnet: 'Tabla resumen normativa VUT por comunidad autónoma (PDF)',
      },
      {
        title: 'Licencia Turística en Madrid: Requisitos, Trámites y Costes 2026',
        slug: 'licencia-turistica-madrid-requisitos-tramites',
        keyword: 'licencia turística Madrid',
        secondaryKeywords: ['VUT Madrid requisitos', 'alquiler turístico Madrid normativa', 'registro vivienda turística Madrid'],
        intent: 'transactional',
        priority: 1,
        type: 'cluster',
        category: 'NORMATIVA',
        estimatedWords: 3000,
        faqTopics: [
          '¿Cuánto cuesta la licencia turística en Madrid?',
          '¿Cuánto tarda en conseguirse la licencia en Madrid?',
          '¿Se puede alquilar un piso turístico en el centro de Madrid?',
        ],
      },
      {
        title: 'Licencia Turística en Barcelona: Moratoria, Requisitos y Alternativas 2026',
        slug: 'licencia-turistica-barcelona-moratoria-requisitos',
        keyword: 'licencia turística Barcelona',
        secondaryKeywords: ['VUT Barcelona', 'moratoria turística Barcelona', 'alquiler turístico Barcelona'],
        intent: 'transactional',
        priority: 1,
        type: 'cluster',
        category: 'NORMATIVA',
        estimatedWords: 3000,
        faqTopics: [
          '¿Se pueden conseguir nuevas licencias turísticas en Barcelona?',
          '¿Qué es la moratoria turística de Barcelona?',
          '¿Se puede comprar una licencia turística en Barcelona?',
        ],
      },
      {
        title: 'Normativa de Alquiler Turístico en Andalucía: Guía Completa 2026',
        slug: 'normativa-alquiler-turistico-andalucia',
        keyword: 'alquiler turístico Andalucía normativa',
        secondaryKeywords: ['VUT Andalucía', 'licencia turística Málaga', 'registro turístico Sevilla'],
        intent: 'informational',
        priority: 1,
        type: 'cluster',
        category: 'NORMATIVA',
        estimatedWords: 2500,
        faqTopics: [
          '¿Cómo registrar una vivienda turística en Andalucía?',
          '¿Qué requisitos tiene la VUT en Málaga?',
        ],
      },
      {
        title: 'Normativa VUT en Valencia y Comunidad Valenciana 2026',
        slug: 'normativa-vut-valencia-comunidad-valenciana',
        keyword: 'normativa VUT Valencia',
        secondaryKeywords: ['licencia turística Valencia', 'alquiler turístico Alicante', 'VUT Comunidad Valenciana'],
        intent: 'informational',
        priority: 1,
        type: 'cluster',
        category: 'NORMATIVA',
        estimatedWords: 2500,
        faqTopics: [
          '¿Cuáles son los requisitos VUT en Valencia?',
          '¿Necesito cédula de habitabilidad para VUT en Valencia?',
        ],
      },
      {
        title: 'Registro de Viajeros: Obligaciones y Cómo Cumplir con la Ley',
        slug: 'registro-viajeros-obligaciones-cumplir-ley',
        keyword: 'registro viajeros alquiler turístico',
        secondaryKeywords: ['parte de viajeros policía', 'SES.Hospedajes', 'registro huéspedes obligatorio'],
        intent: 'informational',
        priority: 1,
        type: 'cluster',
        category: 'NORMATIVA',
        estimatedWords: 2500,
        faqTopics: [
          '¿Es obligatorio registrar a los huéspedes?',
          '¿Cómo funciona SES.Hospedajes?',
          '¿Qué datos hay que comunicar a la policía?',
          '¿Cuál es la multa por no registrar viajeros?',
        ],
      },
      {
        title: 'Normativa VUT en Canarias: Requisitos y Particularidades 2026',
        slug: 'normativa-vut-canarias-requisitos',
        keyword: 'normativa VUT Canarias',
        secondaryKeywords: ['licencia turística Canarias', 'alquiler vacacional Tenerife', 'VUT Gran Canaria'],
        intent: 'informational',
        priority: 2,
        type: 'cluster',
        category: 'NORMATIVA',
        estimatedWords: 2500,
        faqTopics: [
          '¿Se puede alquilar turísticamente en Canarias?',
          '¿Qué zonas permiten VUT en Canarias?',
        ],
      },
      {
        title: 'Normativa VUT en Baleares: Mallorca, Menorca, Ibiza y Formentera',
        slug: 'normativa-vut-baleares-mallorca-ibiza',
        keyword: 'normativa VUT Baleares',
        secondaryKeywords: ['licencia turística Mallorca', 'alquiler turístico Ibiza', 'VUT Baleares'],
        intent: 'informational',
        priority: 2,
        type: 'cluster',
        category: 'NORMATIVA',
        estimatedWords: 2500,
        faqTopics: [
          '¿Cuántas licencias turísticas hay en Baleares?',
          '¿Se puede alquilar un piso turístico en Ibiza?',
        ],
      },
      {
        title: 'Normativa VUT en País Vasco y Cataluña 2026',
        slug: 'normativa-vut-pais-vasco-cataluna',
        keyword: 'normativa VUT País Vasco',
        secondaryKeywords: ['licencia turística Bilbao', 'VUT San Sebastián', 'normativa turística Cataluña'],
        intent: 'informational',
        priority: 2,
        type: 'cluster',
        category: 'NORMATIVA',
        estimatedWords: 2500,
        faqTopics: [
          '¿Cuáles son los requisitos en País Vasco?',
          '¿Hay moratoria en Cataluña fuera de Barcelona?',
        ],
      },
      {
        title: 'Multas y Sanciones por Alquiler Turístico Ilegal en España',
        slug: 'multas-sanciones-alquiler-turistico-ilegal',
        keyword: 'multas alquiler turístico ilegal',
        secondaryKeywords: ['sanción VUT sin licencia', 'alquiler turístico sin permiso', 'denuncia alquiler turístico'],
        intent: 'informational',
        priority: 1,
        type: 'cluster',
        category: 'NORMATIVA',
        estimatedWords: 2000,
        faqTopics: [
          '¿Cuánto es la multa por alquilar sin licencia turística?',
          '¿Me pueden denunciar los vecinos?',
          '¿Cómo saber si mi comunidad permite alquiler turístico?',
        ],
      },
      {
        title: 'Comunidad de Propietarios y Alquiler Turístico: Derechos y Límites',
        slug: 'comunidad-propietarios-alquiler-turistico',
        keyword: 'comunidad propietarios alquiler turístico',
        secondaryKeywords: ['vecinos contra alquiler turístico', 'prohibir VUT comunidad', 'mayoría necesaria prohibir turístico'],
        intent: 'informational',
        priority: 2,
        type: 'cluster',
        category: 'NORMATIVA',
        estimatedWords: 2000,
        faqTopics: [
          '¿Puede una comunidad de vecinos prohibir el alquiler turístico?',
          '¿Qué mayoría se necesita para prohibir VUT?',
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PILAR 3: FISCALIDAD DEL ALQUILER TURÍSTICO
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'fiscalidad',
    pillarTitle: 'Fiscalidad del Alquiler Turístico en España: Impuestos, IVA y Obligaciones',
    pillarSlug: 'fiscalidad-alquiler-turistico-espana-impuestos',
    primaryKeyword: 'fiscalidad alquiler turístico',
    secondaryKeywords: ['impuestos alquiler vacacional', 'IVA apartamento turístico', 'tributación vivienda turística'],
    description: 'Todo sobre impuestos, IVA, IRPF y obligaciones fiscales del alquiler vacacional',
    category: 'NORMATIVA',
    articles: [
      {
        title: 'Fiscalidad del Alquiler Turístico en España: Guía Completa de Impuestos 2026',
        slug: 'fiscalidad-alquiler-turistico-espana-impuestos',
        keyword: 'fiscalidad alquiler turístico España',
        secondaryKeywords: ['impuestos alquiler vacacional', 'tributación vivienda turística', 'hacienda alquiler turístico'],
        intent: 'informational',
        priority: 1,
        type: 'pillar',
        category: 'NORMATIVA',
        estimatedWords: 5000,
        faqTopics: [
          '¿Cuánto hay que pagar de impuestos por alquiler turístico?',
          '¿Tengo que darme de alta como autónomo?',
          '¿Qué gastos son deducibles en alquiler turístico?',
          '¿Hay que cobrar IVA a los huéspedes?',
        ],
        leadMagnet: 'Guía fiscal del alquiler turístico (PDF)',
      },
      {
        title: 'IVA en Alquiler Turístico: ¿Cuándo Hay que Cobrarlo y Cuándo No?',
        slug: 'iva-alquiler-turistico-cuando-cobrar',
        keyword: 'IVA alquiler turístico',
        secondaryKeywords: ['IVA apartamento turístico', 'IVA vivienda turística', 'exención IVA alquiler vacacional'],
        intent: 'informational',
        priority: 1,
        type: 'cluster',
        category: 'NORMATIVA',
        estimatedWords: 2500,
        faqTopics: [
          '¿Cuándo se aplica IVA al alquiler turístico?',
          '¿Qué tipo de IVA se aplica?',
          '¿Los servicios complementarios llevan IVA?',
        ],
      },
      {
        title: 'Declaración de la Renta y Alquiler Turístico: Cómo Declarar Ingresos de Airbnb',
        slug: 'declaracion-renta-alquiler-turistico-airbnb',
        keyword: 'declaración renta alquiler turístico',
        secondaryKeywords: ['IRPF airbnb', 'declarar ingresos booking', 'hacienda alquiler vacacional'],
        intent: 'informational',
        priority: 1,
        type: 'cluster',
        category: 'NORMATIVA',
        estimatedWords: 2500,
        faqTopics: [
          '¿Cómo declarar los ingresos de Airbnb en la renta?',
          '¿Qué gastos puedo deducir?',
          '¿Hacienda sabe cuánto gano con Airbnb?',
        ],
      },
      {
        title: 'Modelo 179: Qué Es, Quién lo Presenta y Cómo Afecta a tu Alquiler',
        slug: 'modelo-179-alquiler-turistico-declaracion',
        keyword: 'modelo 179 alquiler turístico',
        secondaryKeywords: ['modelo 179 hacienda', 'declaración informativa alquiler turístico'],
        intent: 'informational',
        priority: 2,
        type: 'cluster',
        category: 'NORMATIVA',
        estimatedWords: 2000,
        faqTopics: [
          '¿Qué es el modelo 179?',
          '¿Quién está obligado a presentarlo?',
          '¿Airbnb comunica mis datos a Hacienda?',
        ],
      },
      {
        title: 'Gastos Deducibles en Alquiler Turístico: Lista Completa',
        slug: 'gastos-deducibles-alquiler-turistico-lista',
        keyword: 'gastos deducibles alquiler turístico',
        secondaryKeywords: ['deducciones alquiler vacacional', 'qué gastos puedo desgravar apartamento turístico'],
        intent: 'transactional',
        priority: 1,
        type: 'cluster',
        category: 'NORMATIVA',
        estimatedWords: 2500,
        faqTopics: [
          '¿Puedo deducir la hipoteca?',
          '¿Los muebles son deducibles?',
          '¿Puedo deducir las comisiones de Airbnb?',
        ],
        leadMagnet: 'Lista de gastos deducibles con ejemplos (PDF)',
      },
      {
        title: 'Autónomo para Alquiler Turístico: ¿Es Obligatorio Darse de Alta?',
        slug: 'autonomo-alquiler-turistico-obligatorio-alta',
        keyword: 'autónomo alquiler turístico',
        secondaryKeywords: ['darse de alta autónomo airbnb', 'obligación autónomo vivienda turística'],
        intent: 'informational',
        priority: 1,
        type: 'cluster',
        category: 'NORMATIVA',
        estimatedWords: 2000,
        faqTopics: [
          '¿Necesito ser autónomo para alquilar en Airbnb?',
          '¿Cuándo es obligatorio darse de alta?',
          '¿Puedo facturar sin ser autónomo?',
        ],
      },
      {
        title: 'Facturación en Alquiler Turístico: ¿Hay que Emitir Facturas a los Huéspedes?',
        slug: 'facturacion-alquiler-turistico-emitir-facturas',
        keyword: 'facturación alquiler turístico',
        secondaryKeywords: ['facturas airbnb', 'factura alquiler vacacional', 'obligación facturar huéspedes'],
        intent: 'informational',
        priority: 2,
        type: 'cluster',
        category: 'NORMATIVA',
        estimatedWords: 2000,
        faqTopics: [
          '¿Tengo que dar factura al huésped?',
          '¿Qué datos debe llevar la factura?',
          '¿Airbnb emite facturas por mí?',
        ],
      },
      {
        title: 'Alquiler Turístico como Empresa vs Particular: ¿Qué Conviene Más?',
        slug: 'alquiler-turistico-empresa-vs-particular',
        keyword: 'alquiler turístico empresa o particular',
        secondaryKeywords: ['SL para alquiler turístico', 'sociedad limitada apartamento turístico'],
        intent: 'comparison',
        priority: 3,
        type: 'cluster',
        category: 'NORMATIVA',
        estimatedWords: 2500,
        faqTopics: [
          '¿Merece la pena crear una SL para alquiler turístico?',
          '¿A partir de cuántos pisos conviene una empresa?',
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PILAR 4: AUTOMATIZACIÓN DEL ALQUILER VACACIONAL
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'automatizacion',
    pillarTitle: 'Automatización del Alquiler Vacacional: Herramientas y Estrategias para Ahorrar Tiempo',
    pillarSlug: 'automatizacion-alquiler-vacacional-herramientas',
    primaryKeyword: 'automatización alquiler vacacional',
    secondaryKeywords: ['automatizar airbnb', 'herramientas gestión apartamento turístico', 'software alquiler vacacional'],
    description: 'Cómo automatizar la gestión de tu alquiler vacacional para ahorrar tiempo y ganar más',
    category: 'AUTOMATIZACION',
    articles: [
      {
        title: 'Automatización del Alquiler Vacacional: Guía Completa para Ahorrar 15h/Semana',
        slug: 'automatizacion-alquiler-vacacional-herramientas',
        keyword: 'automatización alquiler vacacional',
        secondaryKeywords: ['automatizar gestión airbnb', 'herramientas automatización turístico'],
        intent: 'informational',
        priority: 1,
        type: 'pillar',
        category: 'AUTOMATIZACION',
        estimatedWords: 5000,
        faqTopics: [
          '¿Qué se puede automatizar en un alquiler vacacional?',
          '¿Cuánto tiempo puedo ahorrar automatizando?',
          '¿Cuánto cuesta automatizar la gestión?',
          '¿Necesito conocimientos técnicos para automatizar?',
        ],
        leadMagnet: 'Mapa de automatización: qué automatizar primero (PDF)',
      },
      {
        title: 'Check-in Automático: Cómo Ofrecer Self Check-in en tu Apartamento Turístico',
        slug: 'check-in-automatico-self-checkin-apartamento-turistico',
        keyword: 'check-in automático apartamento turístico',
        secondaryKeywords: ['self check-in airbnb', 'check-in sin contacto', 'caja de llaves alquiler vacacional'],
        intent: 'informational',
        priority: 1,
        type: 'cluster',
        category: 'AUTOMATIZACION',
        estimatedWords: 2500,
        faqTopics: [
          '¿Cómo funciona el self check-in?',
          '¿Es seguro el check-in automático?',
          '¿Los huéspedes prefieren check-in en persona o automático?',
        ],
      },
      {
        title: 'Manual Digital para Huéspedes: Qué Incluir y Cómo Crearlo',
        slug: 'manual-digital-huespedes-que-incluir-como-crear',
        keyword: 'manual digital huéspedes',
        secondaryKeywords: ['guía digital apartamento turístico', 'guidebook airbnb', 'instrucciones huéspedes digital'],
        intent: 'transactional',
        priority: 1,
        type: 'cluster',
        category: 'GUIAS',
        estimatedWords: 2500,
        faqTopics: [
          '¿Qué debe incluir un manual digital?',
          '¿Cómo comparto el manual con los huéspedes?',
          '¿Un manual digital reduce las llamadas de huéspedes?',
        ],
        leadMagnet: 'Plantilla de manual digital para huéspedes (PDF)',
      },
      {
        title: 'Precios Dinámicos para Airbnb: Cómo Funciona el Revenue Management',
        slug: 'precios-dinamicos-airbnb-revenue-management',
        keyword: 'precios dinámicos Airbnb',
        secondaryKeywords: ['revenue management alquiler vacacional', 'pricing automático booking', 'herramientas precio dinámico'],
        intent: 'informational',
        priority: 1,
        type: 'cluster',
        category: 'AUTOMATIZACION',
        estimatedWords: 3000,
        faqTopics: [
          '¿Qué es el revenue management en alquiler vacacional?',
          '¿Merece la pena usar precios dinámicos?',
          '¿Qué herramientas de pricing existen?',
        ],
      },
      {
        title: 'QR Code para Apartamento Turístico: Usos Prácticos y Cómo Generarlos',
        slug: 'qr-code-apartamento-turistico-usos-generar',
        keyword: 'QR code apartamento turístico',
        secondaryKeywords: ['código QR alquiler vacacional', 'QR wifi huéspedes', 'QR manual digital'],
        intent: 'transactional',
        priority: 2,
        type: 'cluster',
        category: 'AUTOMATIZACION',
        estimatedWords: 2000,
        faqTopics: [
          '¿Para qué sirve un QR en un apartamento turístico?',
          '¿Cómo genero un QR para el WiFi?',
        ],
      },
      {
        title: 'Instrucciones WiFi para Huéspedes: Templates y Mejores Prácticas',
        slug: 'instrucciones-wifi-huespedes-templates',
        keyword: 'instrucciones WiFi huéspedes',
        secondaryKeywords: ['wifi apartamento turístico', 'cómo compartir wifi con huéspedes', 'wifi QR airbnb'],
        intent: 'transactional',
        priority: 2,
        type: 'cluster',
        category: 'AUTOMATIZACION',
        estimatedWords: 1500,
        faqTopics: [
          '¿Cómo comparto la contraseña WiFi fácilmente?',
          '¿Necesito un router separado para huéspedes?',
        ],
      },
      {
        title: 'Domótica para Alquiler Vacacional: Qué Merece la Pena Instalar',
        slug: 'domotica-alquiler-vacacional-que-instalar',
        keyword: 'domótica alquiler vacacional',
        secondaryKeywords: ['smart home apartamento turístico', 'termostato inteligente airbnb', 'sensores ruido alquiler turístico'],
        intent: 'comparison',
        priority: 3,
        type: 'cluster',
        category: 'AUTOMATIZACION',
        estimatedWords: 2500,
        faqTopics: [
          '¿Qué dispositivos inteligentes instalar en un alquiler turístico?',
          '¿Merece la pena la domótica para Airbnb?',
          '¿Puedo poner cámaras en mi alquiler turístico?',
        ],
      },
      {
        title: 'Comparativa de Software de Gestión de Alquiler Vacacional 2026',
        slug: 'comparativa-software-gestion-alquiler-vacacional',
        keyword: 'software gestión alquiler vacacional',
        secondaryKeywords: ['PMS alquiler vacacional', 'comparativa software airbnb', 'mejor app gestión apartamentos'],
        intent: 'comparison',
        priority: 1,
        type: 'cluster',
        category: 'AUTOMATIZACION',
        estimatedWords: 3000,
        faqTopics: [
          '¿Qué software necesito para gestionar mi alquiler?',
          '¿Cuál es el mejor PMS para alquiler vacacional?',
          '¿Merece la pena pagar por un software de gestión?',
        ],
        leadMagnet: 'Tabla comparativa de software de gestión (PDF)',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PILAR 5: MARKETING PARA ALQUILER VACACIONAL
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'marketing',
    pillarTitle: 'Marketing para Alquiler Vacacional: Cómo Conseguir Más Reservas y Mejor Visibilidad',
    pillarSlug: 'marketing-alquiler-vacacional-mas-reservas',
    primaryKeyword: 'marketing alquiler vacacional',
    secondaryKeywords: ['cómo conseguir más reservas airbnb', 'visibilidad alquiler turístico', 'promoción apartamento turístico'],
    description: 'Estrategias de marketing para llenar tu calendario y destacar en plataformas',
    category: 'MARKETING',
    articles: [
      {
        title: 'Marketing para Alquiler Vacacional: 20 Estrategias para Llenar tu Calendario',
        slug: 'marketing-alquiler-vacacional-mas-reservas',
        keyword: 'marketing alquiler vacacional',
        secondaryKeywords: ['cómo llenar calendario airbnb', 'más reservas alquiler turístico'],
        intent: 'informational',
        priority: 1,
        type: 'pillar',
        category: 'MARKETING',
        estimatedWords: 5000,
        faqTopics: [
          '¿Cómo consigo más reservas en Airbnb?',
          '¿Debo estar en varias plataformas?',
          '¿Merece la pena invertir en marketing para mi alquiler?',
        ],
        leadMagnet: 'Checklist de 20 acciones de marketing (PDF)',
      },
      {
        title: 'Cómo Optimizar tu Anuncio en Airbnb para Aparecer Primero en los Resultados',
        slug: 'optimizar-anuncio-airbnb-posicionamiento',
        keyword: 'optimizar anuncio Airbnb',
        secondaryKeywords: ['SEO Airbnb', 'algoritmo Airbnb', 'cómo aparecer primero en Airbnb'],
        intent: 'transactional',
        priority: 1,
        type: 'cluster',
        category: 'MARKETING',
        estimatedWords: 3000,
        faqTopics: [
          '¿Cómo funciona el algoritmo de Airbnb?',
          '¿Qué factores mejoran mi posicionamiento en Airbnb?',
          '¿Cada cuánto debo actualizar mi anuncio?',
        ],
      },
      {
        title: 'Fotografía Profesional para Alquiler Vacacional: Guía DIY',
        slug: 'fotografia-profesional-alquiler-vacacional-guia',
        keyword: 'fotos profesionales apartamento turístico',
        secondaryKeywords: ['fotografía airbnb', 'cómo hacer buenas fotos apartamento', 'fotos para booking'],
        intent: 'informational',
        priority: 1,
        type: 'cluster',
        category: 'MARKETING',
        estimatedWords: 2500,
        faqTopics: [
          '¿Merece la pena contratar un fotógrafo profesional?',
          '¿Cuántas fotos debe tener mi anuncio?',
          '¿Cómo hacer buenas fotos con el móvil?',
        ],
      },
      {
        title: 'Cómo Escribir el Título y Descripción Perfectos para tu Anuncio',
        slug: 'titulo-descripcion-perfectos-anuncio-airbnb',
        keyword: 'título descripción anuncio Airbnb',
        secondaryKeywords: ['copywriting alquiler vacacional', 'cómo escribir anuncio booking', 'descripción apartamento turístico'],
        intent: 'transactional',
        priority: 1,
        type: 'cluster',
        category: 'MARKETING',
        estimatedWords: 2000,
        faqTopics: [
          '¿Cuál es el título ideal para Airbnb?',
          '¿Cuántos caracteres debe tener la descripción?',
          '¿Qué palabras clave usar en el anuncio?',
        ],
        leadMagnet: 'Templates de títulos y descripciones (PDF)',
      },
      {
        title: 'Airbnb vs Booking vs Vrbo: Dónde Publicar tu Alquiler Vacacional',
        slug: 'airbnb-vs-booking-vs-vrbo-donde-publicar',
        keyword: 'Airbnb vs Booking',
        secondaryKeywords: ['comparativa plataformas alquiler vacacional', 'Vrbo España', 'mejor plataforma alquiler turístico'],
        intent: 'comparison',
        priority: 1,
        type: 'cluster',
        category: 'MARKETING',
        estimatedWords: 3000,
        faqTopics: [
          '¿Qué plataforma cobra menos comisión?',
          '¿Es mejor Airbnb o Booking para alquiler vacacional?',
          '¿Puedo estar en varias plataformas a la vez?',
        ],
        leadMagnet: 'Tabla comparativa de plataformas (PDF)',
      },
      {
        title: 'Cómo Conseguir Más Reseñas 5 Estrellas en tu Alquiler Vacacional',
        slug: 'conseguir-resenas-5-estrellas-alquiler-vacacional',
        keyword: 'conseguir reseñas Airbnb',
        secondaryKeywords: ['mejorar valoraciones booking', 'cómo pedir reseñas huéspedes', 'responder reseñas negativas'],
        intent: 'transactional',
        priority: 1,
        type: 'cluster',
        category: 'MARKETING',
        estimatedWords: 2000,
        faqTopics: [
          '¿Cómo pido reseñas sin ser pesado?',
          '¿Cómo respondo a una reseña negativa?',
          '¿Las reseñas afectan al posicionamiento?',
        ],
      },
      {
        title: 'Reservas Directas: Cómo Crear tu Propia Web de Reservas',
        slug: 'reservas-directas-crear-web-propia-reservas',
        keyword: 'reservas directas alquiler vacacional',
        secondaryKeywords: ['web propia apartamento turístico', 'motor reservas alquiler vacacional', 'evitar comisiones airbnb'],
        intent: 'transactional',
        priority: 2,
        type: 'cluster',
        category: 'MARKETING',
        estimatedWords: 2500,
        faqTopics: [
          '¿Merece la pena tener web propia para mi alquiler?',
          '¿Cómo consigo reservas directas?',
          '¿Cuánto me ahorro sin comisiones de plataformas?',
        ],
      },
      {
        title: 'Cómo Destacar en Temporada Baja: Estrategias para Mantener la Ocupación',
        slug: 'estrategias-temporada-baja-ocupacion-alquiler',
        keyword: 'ocupación temporada baja alquiler vacacional',
        secondaryKeywords: ['cómo llenar apartamento temporada baja', 'descuentos airbnb temporada baja'],
        intent: 'informational',
        priority: 2,
        type: 'cluster',
        category: 'MARKETING',
        estimatedWords: 2000,
        faqTopics: [
          '¿Cómo mantengo la ocupación en temporada baja?',
          '¿Debo bajar mucho el precio en temporada baja?',
          '¿Qué tipo de huésped busca en temporada baja?',
        ],
      },
      {
        title: 'Superhost en Airbnb: Cómo Conseguirlo y Qué Beneficios Tiene',
        slug: 'superhost-airbnb-como-conseguir-beneficios',
        keyword: 'Superhost Airbnb',
        secondaryKeywords: ['requisitos Superhost', 'beneficios Superhost airbnb', 'cómo ser Superhost'],
        intent: 'informational',
        priority: 2,
        type: 'cluster',
        category: 'MARKETING',
        estimatedWords: 2000,
        faqTopics: [
          '¿Qué requisitos tiene el programa Superhost?',
          '¿Ser Superhost da más reservas?',
          '¿Puedo perder el estado Superhost?',
        ],
      },
      {
        title: 'Cómo Conseguir Más Reservas en Airbnb: 15 Estrategias que Funcionan en 2026',
        slug: 'como-conseguir-mas-reservas-airbnb-estrategias',
        keyword: 'cómo conseguir más reservas Airbnb',
        secondaryKeywords: ['aumentar reservas alquiler vacacional', 'más bookings airbnb', 'llenar calendario airbnb', 'estrategias reservas'],
        intent: 'transactional',
        priority: 1,
        type: 'cluster',
        category: 'MARKETING',
        estimatedWords: 3000,
        faqTopics: [
          '¿Cuántas reservas al mes es normal en Airbnb?',
          '¿Es mejor tener muchas reservas cortas o pocas largas?',
          '¿Cómo afecta el tiempo de respuesta a las reservas?',
          '¿Las reservas instantáneas dan más visibilidad?',
        ],
      },
      {
        title: 'PriceLabs para Airbnb: Guía Completa de Configuración y Estrategia',
        slug: 'pricelabs-airbnb-guia-configuracion-estrategia',
        keyword: 'PriceLabs Airbnb',
        secondaryKeywords: ['configurar PriceLabs', 'precios dinámicos PriceLabs', 'PriceLabs vs Beyond Pricing', 'revenue management airbnb'],
        intent: 'transactional',
        priority: 1,
        type: 'cluster',
        category: 'AUTOMATIZACION',
        estimatedWords: 3000,
        faqTopics: [
          '¿Merece la pena PriceLabs para una sola propiedad?',
          '¿Cómo configuro PriceLabs para el mercado español?',
          '¿PriceLabs funciona con Booking además de Airbnb?',
          '¿Cuánto aumentan los ingresos con PriceLabs?',
        ],
      },
      {
        title: 'Estancia Mínima en Airbnb: Por Qué Reducirla Mejora tu Posicionamiento',
        slug: 'estancia-minima-airbnb-posicionamiento-algoritmo',
        keyword: 'estancia mínima Airbnb',
        secondaryKeywords: ['mínimo noches airbnb', 'algoritmo airbnb estancia mínima', 'reducir estancia mínima', 'posicionamiento airbnb'],
        intent: 'informational',
        priority: 1,
        type: 'cluster',
        category: 'MARKETING',
        estimatedWords: 2500,
        faqTopics: [
          '¿Qué estancia mínima debo poner en Airbnb?',
          '¿El algoritmo de Airbnb penaliza estancias mínimas altas?',
          '¿Cómo compenso el coste de limpieza en estancias de 1 noche?',
          '¿Debo tener diferente estancia mínima según temporada?',
        ],
      },
      {
        title: 'Tarifa de Limpieza en Airbnb: Cuánto Cobrar sin que el Algoritmo te Penalice',
        slug: 'tarifa-limpieza-airbnb-cuanto-cobrar-algoritmo',
        keyword: 'tarifa limpieza Airbnb',
        secondaryKeywords: ['cleaning fee airbnb', 'cuánto cobrar limpieza airbnb', 'algoritmo airbnb tarifa limpieza', 'limpieza reservas una noche'],
        intent: 'informational',
        priority: 1,
        type: 'cluster',
        category: 'MARKETING',
        estimatedWords: 2500,
        faqTopics: [
          '¿Airbnb penaliza tarifas de limpieza altas?',
          '¿Es mejor incluir la limpieza en el precio por noche?',
          '¿Qué pasa cuando la tarifa de limpieza cuesta más que la noche?',
          '¿Cuál es la tarifa de limpieza media en España?',
        ],
      },
      {
        title: 'Cómo Analizar a tu Competencia en Airbnb y Detectar Oportunidades',
        slug: 'analizar-competencia-airbnb-detectar-oportunidades',
        keyword: 'analizar competencia Airbnb',
        secondaryKeywords: ['competidores airbnb', 'análisis mercado alquiler vacacional', 'AirDNA', 'amenidades competencia'],
        intent: 'informational',
        priority: 1,
        type: 'cluster',
        category: 'MARKETING',
        estimatedWords: 2500,
        faqTopics: [
          '¿Cómo sé qué amenidades ofrece mi competencia?',
          '¿Qué herramientas uso para analizar el mercado de mi zona?',
          '¿Con qué antelación reservan los huéspedes de mi zona?',
          '¿Cómo identifico mi público objetivo en Airbnb?',
        ],
      },
      {
        title: 'Identifica tu Público Objetivo en Airbnb: Familias, Parejas, Nómadas o Business',
        slug: 'publico-objetivo-airbnb-segmentar-huespedes',
        keyword: 'público objetivo Airbnb',
        secondaryKeywords: ['segmentar huéspedes', 'tipo huésped airbnb', 'nómadas digitales airbnb', 'viajeros business alquiler'],
        intent: 'informational',
        priority: 1,
        type: 'cluster',
        category: 'MARKETING',
        estimatedWords: 2500,
        faqTopics: [
          '¿Cómo sé qué tipo de huésped atrae mi propiedad?',
          '¿Debo adaptar mi anuncio a un público específico?',
          '¿Es rentable enfocarse en nómadas digitales?',
          '¿Qué buscan los viajeros de negocios en un apartamento?',
        ],
      },
      {
        title: 'Amenidades que Más Reservas Generan: Datos Reales del Mercado Español',
        slug: 'amenidades-mas-reservas-generan-datos-espana',
        keyword: 'amenidades más reservas Airbnb',
        secondaryKeywords: ['qué amenidades poner airbnb', 'equipamiento apartamento turístico', 'amenities que venden', 'WiFi parking piscina airbnb'],
        intent: 'informational',
        priority: 1,
        type: 'cluster',
        category: 'MARKETING',
        estimatedWords: 2500,
        faqTopics: [
          '¿Qué amenidades buscan más los huéspedes en España?',
          '¿Merece la pena invertir en una cafetera Nespresso?',
          '¿El parking propio aumenta las reservas?',
          '¿Qué amenidades tienen mejor ROI?',
        ],
      },
      {
        title: 'Lead Time: Cómo Usar el Tiempo de Antelación de Reserva a tu Favor',
        slug: 'lead-time-antelacion-reserva-airbnb-estrategia',
        keyword: 'lead time reservas Airbnb',
        secondaryKeywords: ['tiempo antelación reservas', 'booking window airbnb', 'anticipación reservas alquiler vacacional'],
        intent: 'informational',
        priority: 2,
        type: 'cluster',
        category: 'MARKETING',
        estimatedWords: 2000,
        faqTopics: [
          '¿Con cuánta antelación reservan los huéspedes en España?',
          '¿Debo bajar precios para last-minute o subir para early birds?',
          '¿El lead time varía según temporada?',
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PILAR 6: EXPERIENCIA DEL HUÉSPED
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'experiencia-huesped',
    pillarTitle: 'Experiencia del Huésped: Cómo Crear Estancias Memorables en tu Alquiler Vacacional',
    pillarSlug: 'experiencia-huesped-alquiler-vacacional',
    primaryKeyword: 'experiencia huésped alquiler vacacional',
    secondaryKeywords: ['mejorar estancia huéspedes', 'guest experience airbnb', 'satisfacción huéspedes'],
    description: 'Todo para crear la mejor experiencia posible para tus huéspedes',
    category: 'MEJORES_PRACTICAS',
    articles: [
      {
        title: 'Experiencia del Huésped: Guía para Crear Estancias 5 Estrellas',
        slug: 'experiencia-huesped-alquiler-vacacional',
        keyword: 'experiencia huésped alquiler vacacional',
        secondaryKeywords: ['mejorar experiencia huéspedes airbnb', 'guest experience'],
        intent: 'informational',
        priority: 1,
        type: 'pillar',
        category: 'MEJORES_PRACTICAS',
        estimatedWords: 4500,
        faqTopics: [
          '¿Qué valoran más los huéspedes en un alquiler vacacional?',
          '¿Cómo supero las expectativas de los huéspedes?',
          '¿Un buen amenities mejora las reseñas?',
        ],
        leadMagnet: 'Checklist de experiencia del huésped (PDF)',
      },
      {
        title: 'Kit de Bienvenida para Huéspedes: Ideas que Marcan la Diferencia',
        slug: 'kit-bienvenida-huespedes-ideas',
        keyword: 'kit bienvenida huéspedes',
        secondaryKeywords: ['welcome pack airbnb', 'detalles bienvenida apartamento turístico'],
        intent: 'transactional',
        priority: 1,
        type: 'cluster',
        category: 'MEJORES_PRACTICAS',
        estimatedWords: 2000,
        faqTopics: [
          '¿Qué incluir en un kit de bienvenida?',
          '¿Cuánto cuesta un kit de bienvenida por huésped?',
        ],
      },
      {
        title: 'Cómo Equipar tu Apartamento Turístico: Lista Esencial de Amenities',
        slug: 'equipar-apartamento-turistico-lista-amenities',
        keyword: 'amenities apartamento turístico',
        secondaryKeywords: ['qué necesita un apartamento turístico', 'equipamiento alquiler vacacional', 'lista compra apartamento airbnb'],
        intent: 'transactional',
        priority: 1,
        type: 'cluster',
        category: 'MEJORES_PRACTICAS',
        estimatedWords: 2500,
        faqTopics: [
          '¿Qué debe tener un apartamento turístico?',
          '¿Qué amenities valoran más los huéspedes?',
          '¿Cuánto cuesta equipar un apartamento turístico desde cero?',
        ],
        leadMagnet: 'Lista de compras completa para apartamento turístico (Excel)',
      },
      {
        title: 'Decoración para Alquiler Vacacional: Ideas para Destacar sin Gastar una Fortuna',
        slug: 'decoracion-alquiler-vacacional-ideas',
        keyword: 'decoración alquiler vacacional',
        secondaryKeywords: ['decorar apartamento turístico', 'interiorismo airbnb', 'cómo decorar para airbnb'],
        intent: 'informational',
        priority: 2,
        type: 'cluster',
        category: 'MEJORES_PRACTICAS',
        estimatedWords: 2000,
        faqTopics: [
          '¿Cómo decorar un alquiler vacacional para que destaque?',
          '¿Merece la pena invertir en decoración?',
        ],
      },
      {
        title: 'Guía de Normas de la Casa para Huéspedes: Qué Incluir y Cómo Comunicarlas',
        slug: 'normas-casa-huespedes-que-incluir',
        keyword: 'normas casa alquiler turístico',
        secondaryKeywords: ['house rules airbnb', 'reglas apartamento turístico', 'normas convivencia huéspedes'],
        intent: 'informational',
        priority: 2,
        type: 'cluster',
        category: 'MEJORES_PRACTICAS',
        estimatedWords: 2000,
        faqTopics: [
          '¿Qué normas poner en un alquiler turístico?',
          '¿Puedo cobrar penalización por incumplimiento?',
          '¿Cómo comunico las normas sin parecer restrictivo?',
        ],
        leadMagnet: 'Template de normas de la casa (PDF)',
      },
      {
        title: 'Check-in y Check-out Perfecto: Protocolo Paso a Paso',
        slug: 'check-in-check-out-perfecto-protocolo',
        keyword: 'protocolo check-in check-out',
        secondaryKeywords: ['check-in alquiler vacacional', 'checkout apartamento turístico', 'entrega llaves huéspedes'],
        intent: 'informational',
        priority: 2,
        type: 'cluster',
        category: 'OPERACIONES',
        estimatedWords: 2000,
        faqTopics: [
          '¿Cuál es el mejor horario de check-in?',
          '¿Cómo gestionar early check-in y late checkout?',
        ],
      },
      {
        title: 'Gestión de Huéspedes Difíciles: Cómo Manejar Conflictos y Situaciones Complicadas',
        slug: 'huespedes-dificiles-gestionar-conflictos',
        keyword: 'huéspedes difíciles alquiler vacacional',
        secondaryKeywords: ['problemas con huéspedes airbnb', 'conflictos alquiler turístico', 'fiestas en apartamento turístico'],
        intent: 'informational',
        priority: 2,
        type: 'cluster',
        category: 'OPERACIONES',
        estimatedWords: 2000,
        faqTopics: [
          '¿Qué hago si el huésped hace una fiesta?',
          '¿Puedo echar a un huésped antes de tiempo?',
          '¿Cómo reclamar daños?',
        ],
      },
      {
        title: 'Recomendaciones Locales para Huéspedes: Cómo Crear una Guía de la Zona',
        slug: 'recomendaciones-locales-huespedes-guia-zona',
        keyword: 'recomendaciones locales huéspedes',
        secondaryKeywords: ['guía local apartamento turístico', 'restaurantes recomendados huéspedes'],
        intent: 'informational',
        priority: 3,
        type: 'cluster',
        category: 'MEJORES_PRACTICAS',
        estimatedWords: 1500,
        faqTopics: [
          '¿Qué información local incluir en mi guía?',
          '¿Debo incluir restaurantes y actividades?',
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PILAR 7: CASOS DE ÉXITO Y ANÁLISIS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'casos-exito',
    pillarTitle: 'Casos de Éxito en Alquiler Vacacional: Historias Reales de Anfitriones en España',
    pillarSlug: 'casos-exito-alquiler-vacacional-espana',
    primaryKeyword: 'casos éxito alquiler vacacional',
    secondaryKeywords: ['historias anfitriones airbnb', 'experiencias alquiler turístico', 'rentabilidad real airbnb'],
    description: 'Historias reales de anfitriones que han tenido éxito con su alquiler vacacional',
    category: 'CASOS_ESTUDIO',
    articles: [
      {
        title: 'Casos de Éxito en Alquiler Vacacional: 10 Historias Reales de Anfitriones en España',
        slug: 'casos-exito-alquiler-vacacional-espana',
        keyword: 'casos éxito alquiler vacacional',
        secondaryKeywords: ['historias éxito airbnb españa', 'rentabilidad real apartamento turístico'],
        intent: 'informational',
        priority: 1,
        type: 'pillar',
        category: 'CASOS_ESTUDIO',
        estimatedWords: 5000,
        faqTopics: [
          '¿Cuánto se puede ganar realmente con un alquiler vacacional?',
          '¿Es tarde para empezar con alquiler turístico?',
          '¿Se puede vivir del alquiler vacacional?',
        ],
      },
      {
        title: 'De 0 a 5 Apartamentos: Cómo Escalar tu Negocio de Alquiler Vacacional',
        slug: 'escalar-negocio-alquiler-vacacional-5-apartamentos',
        keyword: 'escalar negocio alquiler vacacional',
        secondaryKeywords: ['crecer alquiler turístico', 'más apartamentos airbnb', 'ampliar negocio vacacional'],
        intent: 'informational',
        priority: 1,
        type: 'cluster',
        category: 'CASOS_ESTUDIO',
        estimatedWords: 2500,
        faqTopics: [
          '¿Cómo paso de 1 a 5 apartamentos?',
          '¿Necesito inversión para escalar?',
          '¿Cuándo contratar ayuda?',
        ],
      },
      {
        title: 'Alquiler Vacacional en Zona Rural: Oportunidades y Estrategias',
        slug: 'alquiler-vacacional-zona-rural-oportunidades',
        keyword: 'alquiler vacacional rural',
        secondaryKeywords: ['turismo rural airbnb', 'casa rural alquiler turístico', 'alquiler vacacional pueblo'],
        intent: 'informational',
        priority: 2,
        type: 'cluster',
        category: 'CASOS_ESTUDIO',
        estimatedWords: 2000,
        faqTopics: [
          '¿Es rentable el alquiler vacacional en zonas rurales?',
          '¿Qué normativa aplica en turismo rural?',
        ],
      },
      {
        title: 'Alquiler Vacacional de Lujo: Cómo Posicionar tu Propiedad en el Segmento Premium',
        slug: 'alquiler-vacacional-lujo-segmento-premium',
        keyword: 'alquiler vacacional lujo',
        secondaryKeywords: ['apartamento turístico premium', 'alquiler vacacional alta gama', 'luxury rental España'],
        intent: 'informational',
        priority: 3,
        type: 'cluster',
        category: 'CASOS_ESTUDIO',
        estimatedWords: 2000,
        faqTopics: [
          '¿Cómo diferenciar mi propiedad como premium?',
          '¿Merece la pena el segmento de lujo?',
        ],
      },
      {
        title: 'Errores que Casi me Arruinan: Lecciones Reales de Anfitriones',
        slug: 'errores-anfitriones-alquiler-vacacional-lecciones',
        keyword: 'errores alquiler vacacional',
        secondaryKeywords: ['errores comunes airbnb', 'fracasos alquiler turístico', 'lecciones anfitrión'],
        intent: 'informational',
        priority: 1,
        type: 'cluster',
        category: 'CASOS_ESTUDIO',
        estimatedWords: 2500,
        faqTopics: [
          '¿Cuáles son los errores más comunes al empezar?',
          '¿Qué puede salir mal en un alquiler turístico?',
        ],
      },
      {
        title: 'Análisis del Mercado de Alquiler Vacacional en España 2026',
        slug: 'analisis-mercado-alquiler-vacacional-espana-2026',
        keyword: 'mercado alquiler vacacional España 2026',
        secondaryKeywords: ['datos alquiler turístico España', 'tendencias turismo vacacional', 'estadísticas airbnb España'],
        intent: 'informational',
        priority: 1,
        type: 'cluster',
        category: 'NOTICIAS',
        estimatedWords: 3000,
        faqTopics: [
          '¿Cuántas viviendas turísticas hay en España?',
          '¿El mercado está saturado?',
          '¿Cuáles son las tendencias para 2026?',
        ],
      },
      {
        title: 'Ciudades Más Rentables para Alquiler Vacacional en España',
        slug: 'ciudades-mas-rentables-alquiler-vacacional-espana',
        keyword: 'ciudades rentables alquiler vacacional España',
        secondaryKeywords: ['dónde invertir alquiler turístico', 'mejores ciudades airbnb España', 'ranking rentabilidad turística'],
        intent: 'informational',
        priority: 1,
        type: 'cluster',
        category: 'CASOS_ESTUDIO',
        estimatedWords: 3000,
        faqTopics: [
          '¿Cuáles son las ciudades más rentables para Airbnb en España?',
          '¿Es mejor costa o ciudad para alquiler turístico?',
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PILAR 8: EMPEZAR DESDE CERO
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'empezar',
    pillarTitle: 'Cómo Empezar con el Alquiler Vacacional: Guía Paso a Paso desde Cero',
    pillarSlug: 'como-empezar-alquiler-vacacional-desde-cero',
    primaryKeyword: 'cómo empezar alquiler vacacional',
    secondaryKeywords: ['empezar con airbnb', 'primer apartamento turístico', 'iniciar negocio alquiler vacacional'],
    description: 'Todo lo que necesita alguien que quiere empezar desde cero con alquiler vacacional',
    category: 'GUIAS',
    articles: [
      {
        title: 'Cómo Empezar con el Alquiler Vacacional: Guía Paso a Paso desde Cero',
        slug: 'como-empezar-alquiler-vacacional-desde-cero',
        keyword: 'cómo empezar alquiler vacacional',
        secondaryKeywords: ['empezar con airbnb desde cero', 'primer alquiler turístico', 'pasos para alquilar turísticamente'],
        intent: 'informational',
        priority: 1,
        type: 'pillar',
        category: 'GUIAS',
        estimatedWords: 5000,
        faqTopics: [
          '¿Cuánto dinero necesito para empezar?',
          '¿Necesito ser propietario para alquilar turísticamente?',
          '¿Cuánto tiempo tarda en ser rentable?',
          '¿Qué es lo primero que debo hacer?',
        ],
        leadMagnet: 'Roadmap completo para empezar (PDF)',
      },
      {
        title: 'Subarrendar para Alquiler Turístico: ¿Es Legal? Guía Completa',
        slug: 'subarrendar-alquiler-turistico-legal',
        keyword: 'subarrendar alquiler turístico',
        secondaryKeywords: ['subarriendo airbnb', 'alquilar piso ajeno en airbnb', 'rental arbitrage España'],
        intent: 'informational',
        priority: 1,
        type: 'cluster',
        category: 'GUIAS',
        estimatedWords: 2500,
        faqTopics: [
          '¿Puedo subalquilar un piso en Airbnb?',
          '¿Necesito permiso del propietario?',
          '¿Es legal el rental arbitrage en España?',
        ],
      },
      {
        title: 'Cuánto Cuesta Montar un Apartamento Turístico: Presupuesto Desglosado',
        slug: 'cuanto-cuesta-montar-apartamento-turistico-presupuesto',
        keyword: 'cuánto cuesta montar apartamento turístico',
        secondaryKeywords: ['inversión inicial alquiler vacacional', 'presupuesto equipar airbnb', 'coste montar vivienda turística'],
        intent: 'transactional',
        priority: 1,
        type: 'cluster',
        category: 'GUIAS',
        estimatedWords: 2500,
        faqTopics: [
          '¿Cuánto dinero necesito para empezar en Airbnb?',
          '¿Qué gastos fijos tiene un apartamento turístico?',
          '¿En cuánto tiempo recupero la inversión?',
        ],
        leadMagnet: 'Plantilla de presupuesto (Excel)',
      },
      {
        title: 'Cómo Crear tu Primer Anuncio en Airbnb: Tutorial Paso a Paso',
        slug: 'crear-primer-anuncio-airbnb-tutorial',
        keyword: 'crear anuncio Airbnb',
        secondaryKeywords: ['publicar en airbnb por primera vez', 'cómo anunciar en airbnb', 'tutorial airbnb'],
        intent: 'transactional',
        priority: 1,
        type: 'cluster',
        category: 'GUIAS',
        estimatedWords: 2500,
        faqTopics: [
          '¿Cómo creo mi primer anuncio en Airbnb?',
          '¿Cuánto tarda en publicarse un anuncio?',
          '¿Qué información necesito para crear el anuncio?',
        ],
      },
      {
        title: 'Alquiler Vacacional vs Alquiler Tradicional: Comparativa de Rentabilidad',
        slug: 'alquiler-vacacional-vs-tradicional-rentabilidad',
        keyword: 'alquiler vacacional vs alquiler tradicional',
        secondaryKeywords: ['es mejor alquiler turístico o largo plazo', 'rentabilidad turístico vs tradicional'],
        intent: 'comparison',
        priority: 1,
        type: 'cluster',
        category: 'GUIAS',
        estimatedWords: 2500,
        faqTopics: [
          '¿Es más rentable el alquiler turístico o el tradicional?',
          '¿Cuáles son los riesgos de cada tipo?',
          '¿Puedo combinar ambos tipos de alquiler?',
        ],
      },
      {
        title: 'Plataforma de Reservas para Principiantes: Por Dónde Empezar',
        slug: 'plataformas-reservas-principiantes',
        keyword: 'plataformas alquiler vacacional principiantes',
        secondaryKeywords: ['dónde publicar alquiler turístico', 'primera plataforma airbnb booking'],
        intent: 'informational',
        priority: 2,
        type: 'cluster',
        category: 'GUIAS',
        estimatedWords: 2000,
        faqTopics: [
          '¿Por qué plataforma debo empezar?',
          '¿Puedo empezar solo con Airbnb?',
        ],
      },
      {
        title: 'Primer Mes como Anfitrión: Qué Esperar y Cómo Prepararte',
        slug: 'primer-mes-anfitrion-que-esperar',
        keyword: 'primer mes anfitrión Airbnb',
        secondaryKeywords: ['primeras reservas airbnb', 'empezar como host', 'primeros pasos anfitrión'],
        intent: 'informational',
        priority: 2,
        type: 'cluster',
        category: 'GUIAS',
        estimatedWords: 2000,
        faqTopics: [
          '¿Cuántas reservas puedo esperar el primer mes?',
          '¿Debo poner precios bajos al principio?',
        ],
      },
    ],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Total de artículos planificados */
export function getTotalArticles(): number {
  return TOPIC_CLUSTERS.reduce((sum, c) => sum + c.articles.length, 0)
}

/** Artículos filtrados por prioridad */
export function getArticlesByPriority(priority: ArticlePriority): ClusterArticle[] {
  return TOPIC_CLUSTERS.flatMap(c => c.articles.filter(a => a.priority === priority))
}

/** Siguiente artículo pendiente de generar (prioridad 1 primero) */
export function getNextArticleToGenerate(existingSlugs: string[]): ClusterArticle | null {
  for (const priority of [1, 2, 3] as ArticlePriority[]) {
    for (const cluster of TOPIC_CLUSTERS) {
      for (const article of cluster.articles) {
        if (article.priority === priority && !existingSlugs.includes(article.slug)) {
          return article
        }
      }
    }
  }
  return null
}

/** Obtener cluster al que pertenece un artículo */
export function getClusterForArticle(slug: string): TopicCluster | null {
  return TOPIC_CLUSTERS.find(c => c.articles.some(a => a.slug === slug)) ?? null
}

/** Artículos relacionados (mismo cluster, excluyendo el actual) */
export function getRelatedArticles(slug: string): ClusterArticle[] {
  const cluster = getClusterForArticle(slug)
  if (!cluster) return []
  return cluster.articles.filter(a => a.slug !== slug)
}

/** Estadísticas del mapa de contenido */
export function getContentMapStats() {
  const total = getTotalArticles()
  const byPriority = {
    urgent: getArticlesByPriority(1).length,
    important: getArticlesByPriority(2).length,
    niceToHave: getArticlesByPriority(3).length,
  }
  const byCluster = TOPIC_CLUSTERS.map(c => ({
    id: c.id,
    name: c.pillarTitle,
    total: c.articles.length,
    pillars: c.articles.filter(a => a.type === 'pillar').length,
    clusters: c.articles.filter(a => a.type === 'cluster').length,
  }))
  const totalWords = TOPIC_CLUSTERS.flatMap(c => c.articles).reduce((sum, a) => sum + a.estimatedWords, 0)

  return { total, byPriority, byCluster, totalWords }
}
