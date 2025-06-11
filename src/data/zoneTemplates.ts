export interface ZoneTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: 'essential' | 'amenities' | 'rules' | 'local' | 'savings' | 'emergency'
  popularity: number // 0-100
  tags: string[]
}

export const zoneCategories = {
  essential: {
    name: 'Imprescindibles',
    description: 'Información vital para cualquier alojamiento',
    order: 1
  },
  amenities: {
    name: 'Comodidades',
    description: 'Equipamiento y servicios disponibles',
    order: 2
  },
  rules: {
    name: 'Normas',
    description: 'Reglas y políticas del alojamiento',
    order: 3
  },
  local: {
    name: 'Información Local',
    description: 'Datos útiles sobre la zona y ciudad',
    order: 4
  },
  savings: {
    name: 'Ahorro',
    description: 'Consejos para ahorrar durante la estancia',
    order: 5
  },
  emergency: {
    name: 'Emergencias',
    description: 'Contactos y procedimientos de emergencia',
    order: 6
  }
}

export const zoneTemplates: ZoneTemplate[] = [
  // IMPRESCINDIBLES (Essential)
  {
    id: 'check-in',
    name: 'Check-in',
    description: 'Proceso de entrada, llaves y acceso',
    icon: 'key',
    category: 'essential',
    popularity: 100,
    tags: ['entrada', 'llaves', 'acceso']
  },
  {
    id: 'check-out',
    name: 'Check-out',
    description: 'Proceso de salida y entrega de llaves',
    icon: 'door-exit',
    category: 'essential',
    popularity: 100,
    tags: ['salida', 'llaves', 'horario']
  },
  {
    id: 'wifi',
    name: 'WiFi',
    description: 'Contraseña y conexión a internet',
    icon: 'wifi',
    category: 'essential',
    popularity: 99,
    tags: ['internet', 'contraseña', 'red']
  },
  {
    id: 'parking',
    name: 'Aparcamiento',
    description: 'Ubicación y normas de parking',
    icon: 'car',
    category: 'essential',
    popularity: 85,
    tags: ['parking', 'coche', 'plaza']
  },
  {
    id: 'directions',
    name: 'Cómo llegar',
    description: 'Indicaciones desde aeropuerto, estación, etc.',
    icon: 'navigation',
    category: 'essential',
    popularity: 95,
    tags: ['direcciones', 'transporte', 'ubicación']
  },
  {
    id: 'local-info',
    name: 'Información local',
    description: 'Horarios, moneda, idioma, voltaje, costumbres',
    icon: 'info',
    category: 'essential',
    popularity: 90,
    tags: ['ciudad', 'cultura', 'horarios']
  },

  // COMODIDADES (Amenities)
  {
    id: 'heating',
    name: 'Calefacción',
    description: 'Sistema de calefacción y termostato',
    icon: 'thermometer',
    category: 'amenities',
    popularity: 80,
    tags: ['temperatura', 'calor', 'termostato']
  },
  {
    id: 'air-conditioning',
    name: 'Aire acondicionado',
    description: 'Control del aire acondicionado',
    icon: 'wind',
    category: 'amenities',
    popularity: 75,
    tags: ['clima', 'frío', 'temperatura']
  },
  {
    id: 'washing-machine',
    name: 'Lavadora',
    description: 'Instrucciones de uso de la lavadora',
    icon: 'washing-machine',
    category: 'amenities',
    popularity: 70,
    tags: ['lavar', 'ropa', 'detergente']
  },
  {
    id: 'dishwasher',
    name: 'Lavavajillas',
    description: 'Cómo usar el lavavajillas',
    icon: 'dishwasher',
    category: 'amenities',
    popularity: 65,
    tags: ['platos', 'cocina', 'limpieza']
  },
  {
    id: 'coffee-machine',
    name: 'Cafetera',
    description: 'Tipo de cafetera y cápsulas',
    icon: 'coffee',
    category: 'amenities',
    popularity: 72,
    tags: ['café', 'desayuno', 'cápsulas']
  },
  {
    id: 'tv',
    name: 'Smart TV',
    description: 'Canales y plataformas disponibles',
    icon: 'tv',
    category: 'amenities',
    popularity: 68,
    tags: ['televisión', 'netflix', 'entretenimiento']
  },
  {
    id: 'oven',
    name: 'Horno',
    description: 'Instrucciones del horno',
    icon: 'oven',
    category: 'amenities',
    popularity: 60,
    tags: ['cocinar', 'cocina', 'temperatura']
  },
  {
    id: 'microwave',
    name: 'Microondas',
    description: 'Uso del microondas',
    icon: 'microwave',
    category: 'amenities',
    popularity: 65,
    tags: ['calentar', 'cocina', 'rápido']
  },
  {
    id: 'induction',
    name: 'Vitrocerámica',
    description: 'Funcionamiento de la placa',
    icon: 'cooktop',
    category: 'amenities',
    popularity: 70,
    tags: ['cocinar', 'cocina', 'inducción']
  },

  // NORMAS (Rules)
  {
    id: 'house-rules',
    name: 'Normas de la casa',
    description: 'Reglas generales del alojamiento',
    icon: 'rules',
    category: 'rules',
    popularity: 88,
    tags: ['normas', 'reglas', 'prohibido']
  },
  {
    id: 'quiet-hours',
    name: 'Horario de silencio',
    description: 'Horas de descanso y ruido',
    icon: 'volume-off',
    category: 'rules',
    popularity: 75,
    tags: ['silencio', 'ruido', 'vecinos']
  },
  {
    id: 'smoking',
    name: 'Política de fumadores',
    description: 'Dónde se puede o no fumar',
    icon: 'smoking',
    category: 'rules',
    popularity: 80,
    tags: ['fumar', 'cigarrillos', 'prohibido']
  },
  {
    id: 'pets',
    name: 'Mascotas',
    description: 'Política sobre animales',
    icon: 'pet',
    category: 'rules',
    popularity: 65,
    tags: ['animales', 'perros', 'gatos']
  },
  {
    id: 'recycling',
    name: 'Reciclaje',
    description: 'Sistema de separación de residuos',
    icon: 'recycle',
    category: 'rules',
    popularity: 70,
    tags: ['basura', 'reciclaje', 'contenedores']
  },

  // INFORMACIÓN LOCAL (Local)
  {
    id: 'transport',
    name: 'Transporte público',
    description: 'Metro, bus, tranvía cercanos',
    icon: 'train',
    category: 'local',
    popularity: 85,
    tags: ['metro', 'bus', 'transporte']
  },
  {
    id: 'supermarket',
    name: 'Supermercados',
    description: 'Tiendas cercanas y horarios',
    icon: 'shopping-cart',
    category: 'local',
    popularity: 82,
    tags: ['compras', 'comida', 'tiendas']
  },
  {
    id: 'restaurants',
    name: 'Restaurantes recomendados',
    description: 'Mejores lugares para comer cerca',
    icon: 'restaurant',
    category: 'local',
    popularity: 78,
    tags: ['comer', 'restaurantes', 'comida']
  },
  {
    id: 'pharmacy',
    name: 'Farmacias',
    description: 'Farmacias cercanas y de guardia',
    icon: 'medical',
    category: 'local',
    popularity: 75,
    tags: ['farmacia', 'medicinas', 'salud']
  },
  {
    id: 'tourist-info',
    name: 'Lugares de interés',
    description: 'Sitios turísticos y actividades',
    icon: 'landmark',
    category: 'local',
    popularity: 72,
    tags: ['turismo', 'visitas', 'monumentos']
  },

  // AHORRO (Savings)
  {
    id: 'save-transport',
    name: '¿Cómo ahorrar en transporte?',
    description: 'Bonos, tarjetas y trucos de transporte',
    icon: 'ticket',
    category: 'savings',
    popularity: 80,
    tags: ['ahorro', 'transporte', 'bonos']
  },
  {
    id: 'save-food',
    name: '¿Cómo ahorrar en comida?',
    description: 'Mercados, ofertas y tips locales',
    icon: 'piggy-bank',
    category: 'savings',
    popularity: 75,
    tags: ['ahorro', 'comida', 'mercados']
  },
  {
    id: 'save-activities',
    name: '¿Cómo ahorrar en actividades?',
    description: 'Días gratuitos, descuentos, etc.',
    icon: 'discount',
    category: 'savings',
    popularity: 70,
    tags: ['ahorro', 'gratis', 'descuentos']
  },

  // EMERGENCIAS (Emergency)
  {
    id: 'emergency-contacts',
    name: 'Contactos de emergencia',
    description: 'Números importantes y protocolo',
    icon: 'emergency',
    category: 'emergency',
    popularity: 95,
    tags: ['emergencia', 'teléfonos', 'urgencia']
  },
  {
    id: 'first-aid',
    name: 'Botiquín',
    description: 'Ubicación del botiquín',
    icon: 'first-aid',
    category: 'emergency',
    popularity: 60,
    tags: ['botiquín', 'medicinas', 'primeros auxilios']
  },
  {
    id: 'electrical-panel',
    name: 'Cuadro eléctrico',
    description: 'Ubicación y uso del diferencial',
    icon: 'electrical',
    category: 'emergency',
    popularity: 65,
    tags: ['electricidad', 'diferencial', 'luz']
  },
  {
    id: 'water-shut-off',
    name: 'Llave de paso',
    description: 'Cómo cortar el agua',
    icon: 'water-off',
    category: 'emergency',
    popularity: 62,
    tags: ['agua', 'llave', 'emergencia']
  }
]