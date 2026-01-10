export interface MultilingualText {
  es: string
  en?: string
  fr?: string
}

export interface InspirationZone {
  id: string
  name: MultilingualText
  category: 'transport' | 'local' | 'services' | 'experience' | 'convenience' | 'safety'
  icon: string
  title: MultilingualText
  description: MultilingualText
  benefits: string[]
  examples: string[]
  tips: string[]
  difficulty: 'easy' | 'medium' | 'advanced'
  impact: 'low' | 'medium' | 'high'
  estimatedTime: string
  color: string
}

export const inspirationZones: InspirationZone[] = [
  {
    id: 'transporte',
    name: { es: 'Transporte', en: 'Transport', fr: 'Transport' },
    category: 'transport',
    icon: 'car',
    title: { es: 'Ayuda a tus huéspedes a moverse por la ciudad', en: 'Help your guests get around the city', fr: 'Aidez vos invités à se déplacer en ville' },
    description: { es: 'Informa sobre todas las opciones de transporte disponibles y facilita su movilidad', en: 'Provide information about all available transport options and facilitate mobility', fr: 'Informez sur toutes les options de transport disponibles et facilitez leur mobilité' },
    benefits: [
      'Huéspedes más independientes y satisfechos',
      'Reduce consultas sobre cómo moverse',
      'Oportunidad de ingresos extra con bonos de transporte'
    ],
    examples: [
      'Compra bonos de autobús/metro y véndelos con un incremento del 10-15%',
      'Añade códigos de descuento para apps de transporte (Uber, Cabify)',
      'Incluye números de taxi locales y tarifas aproximadas',
      'Mapas con rutas de transporte público cerca del alojamiento'
    ],
    tips: [
      'Haz fotos de las paradas más cercanas con indicaciones',
      'Negocia descuentos con empresas de alquiler de bicicletas/patinetes',
      'Incluye horarios de transporte público los fines de semana',
      'Advierte sobre zonas seguras para aparcar vehículos alquilados'
    ],
    difficulty: 'medium',
    impact: 'high',
    estimatedTime: '2-3 horas configurar',
    color: 'bg-blue-500'
  },
  {
    id: 'basuras',
    name: { es: 'Basuras y Reciclaje', en: 'Trash & Recycling', fr: 'Déchets et Recyclage' },
    category: 'local',
    icon: 'package',
    title: { es: 'Ayuda a tus huéspedes a reciclar correctamente', en: 'Help your guests recycle correctly', fr: 'Aidez vos invités à recycler correctement' },
    description: { es: 'Explica el sistema de reciclaje local y ubicaciones de contenedores', en: 'Explain the local recycling system and container locations', fr: 'Expliquez le système de recyclage local et les emplacements des conteneurs' },
    benefits: [
      'Huéspedes contribuyen al cuidado del medio ambiente',
      'Evitas problemas con la comunidad de vecinos',
      'Imagen más responsable de tu alojamiento'
    ],
    examples: [
      'Mapa con contenedores más cercanos y ruta desde el apartamento',
      'Fotos de los diferentes tipos de contenedores de tu ciudad',
      'Horarios específicos para sacar la basura orgánica',
      'Explicación de qué va en cada contenedor con ejemplos visuales'
    ],
    tips: [
      'Usa Google Street View para mostrar la ruta exacta',
      'Incluye los horarios de recogida de tu barrio específico',
      'Explica si necesitan tarjeta o código para abrir contenedores',
      'Añade bolsas de diferentes colores y etiquétalas'
    ],
    difficulty: 'easy',
    impact: 'medium',
    estimatedTime: '1 hora configurar',
    color: 'bg-green-500'
  },
  {
    id: 'restaurantes',
    name: { es: 'Restaurantes y Comida', en: 'Restaurants & Food', fr: 'Restaurants et Nourriture' },
    category: 'experience',
    icon: 'utensils',
    title: { es: 'Recomienda los mejores lugares para comer', en: 'Recommend the best places to eat', fr: 'Recommandez les meilleurs endroits pour manger' },
    description: { es: 'Comparte tus restaurantes favoritos y opciones de delivery', en: 'Share your favorite restaurants and delivery options', fr: 'Partagez vos restaurants préférés et options de livraison' },
    benefits: [
      'Huéspedes viven experiencias auténticas',
      'Apoyas negocios locales',
      'Posibles comisiones por recomendaciones'
    ],
    examples: [
      'Lista de restaurantes por categorías (desayuno, almuerzo, cena)',
      'Códigos de descuento para apps de delivery',
      'Horarios de mercados locales y productos típicos',
      'Restaurantes con menús en inglés/otros idiomas'
    ],
    tips: [
      'Incluye rangos de precios y tipo de cocina',
      'Negocia descuentos del 10% para tus huéspedes',
      'Añade reservas recomendadas y números de teléfono',
      'Marca opciones vegetarianas, veganas y sin gluten'
    ],
    difficulty: 'medium',
    impact: 'high',
    estimatedTime: '3-4 horas configurar',
    color: 'bg-orange-500'
  },
  {
    id: 'supermercados',
    name: { es: 'Supermercados y Compras', en: 'Supermarkets & Shopping', fr: 'Supermarchés et Courses' },
    category: 'convenience',
    icon: 'package',
    title: { es: 'Facilita las compras básicas de tus huéspedes', en: 'Make basic shopping easy for your guests', fr: 'Facilitez les courses de base de vos invités' },
    description: { es: 'Ubica supermercados, horarios y productos locales', en: 'Locate supermarkets, hours and local products', fr: 'Localisez les supermarchés, horaires et produits locaux' },
    benefits: [
      'Huéspedes pueden cocinar y ahorrar dinero',
      'Menos preguntas sobre dónde comprar',
      'Experiencia más autónoma'
    ],
    examples: [
      'Mapa con supermercados más cercanos y horarios',
      'Lista de productos típicos españoles que probar',
      'Ubicación de farmacias 24h y con guardia',
      'Mercados locales y horarios especiales'
    ],
    tips: [
      'Incluye supermercados económicos y premium',
      'Explica el sistema de monedas para carritos',
      'Marca supermercados abiertos domingos y festivos',
      'Añade ubicación de cajeros automáticos cercanos'
    ],
    difficulty: 'easy',
    impact: 'medium',
    estimatedTime: '1-2 horas configurar',
    color: 'bg-purple-500'
  },
  {
    id: 'emergencias',
    name: { es: 'Emergencias y Seguridad', en: 'Emergency & Safety', fr: 'Urgences et Sécurité' },
    category: 'safety',
    icon: 'phone',
    title: { es: 'Información crucial para situaciones de emergencia', en: 'Crucial information for emergency situations', fr: 'Informations cruciales pour les situations d\'urgence' },
    description: { es: 'Números importantes y protocolos de seguridad', en: 'Important numbers and safety protocols', fr: 'Numéros importants et protocoles de sécurité' },
    benefits: [
      'Huéspedes se sienten más seguros',
      'Reduce tu responsabilidad legal',
      'Preparación ante imprevistos'
    ],
    examples: [
      'Números de emergencia: 112, policía, bomberos, ambulancia',
      'Ubicación del hospital más cercano',
      'Protocolo en caso de incendio o terremoto',
      'Números de urgencias médicas que hablen inglés'
    ],
    tips: [
      'Incluye el número de tu seguro de hogar',
      'Ubica la farmacia de guardia más cercana',
      'Explica cómo cortar agua, gas y electricidad',
      'Añade números de cerrajeros de confianza'
    ],
    difficulty: 'easy',
    impact: 'high',
    estimatedTime: '1 hora configurar',
    color: 'bg-red-500'
  },
  {
    id: 'ocio',
    name: { es: 'Ocio y Entretenimiento', en: 'Leisure & Entertainment', fr: 'Loisirs et Divertissement' },
    category: 'experience',
    icon: 'tv',
    title: { es: 'Experiencias únicas en tu ciudad', en: 'Unique experiences in your city', fr: 'Expériences uniques dans votre ville' },
    description: { es: 'Actividades, museos y entretenimiento local', en: 'Activities, museums and local entertainment', fr: 'Activités, musées et divertissements locaux' },
    benefits: [
      'Huéspedes tienen experiencias memorables',
      'Estancias más largas y mejores reviews',
      'Comisiones por actividades recomendadas'
    ],
    examples: [
      'Museos gratuitos y días de entrada libre',
      'Rutas de senderismo o paseos en bicicleta',
      'Eventos culturales y festivales de temporada',
      'Miradores y spots para fotos instagrameables'
    ],
    tips: [
      'Categoriza por intereses: cultura, naturaleza, nightlife',
      'Incluye precios y cómo reservar entradas',
      'Negocia descuentos para huéspedes',
      'Añade actividades para días de lluvia'
    ],
    difficulty: 'medium',
    impact: 'high',
    estimatedTime: '4-5 horas configurar',
    color: 'bg-pink-500'
  },
  {
    id: 'wifi-vecinos',
    name: { es: 'WiFi de Vecinos', en: 'Neighbor WiFi', fr: 'WiFi des voisins' },
    category: 'convenience',
    icon: 'wifi',
    title: { es: 'Backup de internet por si falla tu WiFi', en: 'Internet backup in case your WiFi fails', fr: 'Sauvegarde internet en cas de panne WiFi' },
    description: { es: 'Acuerdos con vecinos para WiFi de emergencia', en: 'Agreements with neighbors for emergency WiFi', fr: 'Accords avec les voisins pour le WiFi d\'urgence' },
    benefits: [
      'Backup en caso de problemas técnicos',
      'Huéspedes siempre conectados',
      'Previene reviews negativas por internet'
    ],
    examples: [
      'Acuerdo con 2-3 vecinos para WiFi de emergencia',
      'Código QR con redes WiFi públicas cercanas',
      'Ubicación de cafeterías con WiFi gratuito',
      'Instrucciones para configurar hotspot móvil'
    ],
    tips: [
      'Ofrece compensación simbólica a vecinos',
      'Ten un router de backup configurado',
      'Incluye números de soporte técnico de tu operadora',
      'Testa la velocidad de redes alternativas'
    ],
    difficulty: 'advanced',
    impact: 'medium',
    estimatedTime: '2-3 horas configurar',
    color: 'bg-indigo-500'
  },
  {
    id: 'lavanderia',
    name: { es: 'Lavandería y Tintorería', en: 'Laundry & Dry Cleaning', fr: 'Laverie et Pressing' },
    category: 'services',
    icon: 'washing',
    title: { es: 'Servicios de lavado para estancias largas', en: 'Laundry services for long stays', fr: 'Services de blanchisserie pour longs séjours' },
    description: { es: 'Ubicación y precios de lavanderías automáticas', en: 'Location and prices of laundromats', fr: 'Emplacement et prix des laveries automatiques' },
    benefits: [
      'Atrae huéspedes de estancias largas',
      'Servicio completo de alojamiento',
      'Diferenciación de la competencia'
    ],
    examples: [
      'Mapa de lavanderías automáticas 24h',
      'Precios por tipo de lavado y secado',
      'Servicios de tintorería para ropa delicada',
      'Apps para encontrar y reservar lavadoras'
    ],
    tips: [
      'Incluye cambio exacto necesario o si aceptan tarjeta',
      'Horarios de lavanderías con servicio',
      'Productos de limpieza disponibles en el apartamento',
      'Tiempo estimado para cada tipo de lavado'
    ],
    difficulty: 'easy',
    impact: 'low',
    estimatedTime: '1 hora configurar',
    color: 'bg-cyan-500'
  }
]

// Helper function to get text from multilingual object
export function getInspirationText(value: MultilingualText | string | undefined, language: string = 'es', fallback: string = ''): string {
  if (!value) return fallback
  if (typeof value === 'string') return value
  return value[language as keyof MultilingualText] || value.es || fallback
}

// Sistema para gestionar qué inspiraciones mostrar
export interface UserInspirationState {
  userId: string
  dismissedZones: string[]
  createdZones: string[]
  lastShownInspiration?: string
  showInspirations: boolean
}

// Función para obtener la siguiente inspiración a mostrar
export function getNextInspiration(
  userState: UserInspirationState,
  existingZoneNames: string[]
): InspirationZone | null {
  if (!userState.showInspirations) return null

  // Filtrar zonas ya creadas y ya descartadas
  const availableZones = inspirationZones.filter(zone => {
    const zoneName = typeof zone.name === 'object' ? zone.name.es : zone.name
    return !userState.dismissedZones.includes(zone.id) &&
      !existingZoneNames.some(existing =>
        existing.toLowerCase().includes(zoneName.toLowerCase()) ||
        zoneName.toLowerCase().includes(existing.toLowerCase())
      )
  })

  if (availableZones.length === 0) return null

  // Seleccionar aleatoriamente pero priorizando impacto alto
  const highImpactZones = availableZones.filter(z => z.impact === 'high')
  const mediumImpactZones = availableZones.filter(z => z.impact === 'medium')
  const lowImpactZones = availableZones.filter(z => z.impact === 'low')

  // 60% probabilidad alto impacto, 30% medio, 10% bajo
  const random = Math.random()
  if (random < 0.6 && highImpactZones.length > 0) {
    return highImpactZones[Math.floor(Math.random() * highImpactZones.length)]
  } else if (random < 0.9 && mediumImpactZones.length > 0) {
    return mediumImpactZones[Math.floor(Math.random() * mediumImpactZones.length)]
  } else if (lowImpactZones.length > 0) {
    return lowImpactZones[Math.floor(Math.random() * lowImpactZones.length)]
  }

  // Fallback a cualquier zona disponible
  return availableZones[Math.floor(Math.random() * availableZones.length)]
}

// Verificar si el usuario tiene todas las zonas esenciales
export function hasAllEssentialZones(existingZoneNames: string[]): boolean {
  const essentialZones = [
    'wifi', 'check-in', 'check-out', 'información básica',
    'climatización', 'aparcamiento', 'normas', 'teléfonos de interés'
  ]

  return essentialZones.every(essential =>
    existingZoneNames.some(existing =>
      existing.toLowerCase().includes(essential) ||
      essential.includes(existing.toLowerCase())
    )
  )
}
