export interface MultilingualText {
  es: string
  en?: string
  fr?: string
}

export interface ZoneTemplate {
  id: string
  name: MultilingualText
  description: MultilingualText
  icon: string
  category: 'essential' | 'amenities' | 'rules' | 'local' | 'savings' | 'emergency'
  popularity: number // 0-100
  tags: string[]
}

export const zoneCategories = {
  essential: {
    name: { es: 'Imprescindibles', en: 'Essential', fr: 'Essentiels' },
    description: { es: 'Información vital para cualquier alojamiento', en: 'Essential information for any accommodation', fr: 'Informations essentielles pour tout hébergement' },
    order: 1
  },
  amenities: {
    name: { es: 'Comodidades', en: 'Amenities', fr: 'Équipements' },
    description: { es: 'Equipamiento y servicios disponibles', en: 'Available equipment and services', fr: 'Équipements et services disponibles' },
    order: 2
  },
  rules: {
    name: { es: 'Normas', en: 'House Rules', fr: 'Règlement' },
    description: { es: 'Reglas y políticas del alojamiento', en: 'Rules and policies', fr: 'Règles et politiques' },
    order: 3
  },
  local: {
    name: { es: 'Información Local', en: 'Local Info', fr: 'Infos Locales' },
    description: { es: 'Datos útiles sobre la zona y ciudad', en: 'Useful info about the area', fr: 'Infos utiles sur la région' },
    order: 4
  },
  savings: {
    name: { es: 'Ahorro', en: 'Savings', fr: 'Économies' },
    description: { es: 'Consejos para ahorrar durante la estancia', en: 'Tips to save during your stay', fr: 'Conseils pour économiser' },
    order: 5
  },
  emergency: {
    name: { es: 'Emergencias', en: 'Emergency', fr: 'Urgences' },
    description: { es: 'Contactos y procedimientos de emergencia', en: 'Emergency contacts and procedures', fr: 'Contacts et procédures d\'urgence' },
    order: 6
  }
}

export const zoneTemplates: ZoneTemplate[] = [
  // IMPRESCINDIBLES (Essential)
  {
    id: 'check-in',
    name: { es: 'Check-in', en: 'Check-in', fr: 'Arrivée' },
    description: { es: 'Proceso de entrada, llaves y acceso', en: 'Entry process, keys and access', fr: 'Processus d\'entrée, clés et accès' },
    icon: 'key',
    category: 'essential',
    popularity: 100,
    tags: ['entrada', 'llaves', 'acceso']
  },
  {
    id: 'check-out',
    name: { es: 'Check-out', en: 'Check-out', fr: 'Départ' },
    description: { es: 'Proceso de salida y entrega de llaves', en: 'Departure process and key return', fr: 'Processus de départ et remise des clés' },
    icon: 'door-exit',
    category: 'essential',
    popularity: 100,
    tags: ['salida', 'llaves', 'horario']
  },
  {
    id: 'wifi',
    name: { es: 'WiFi', en: 'WiFi', fr: 'WiFi' },
    description: { es: 'Contraseña y conexión a internet', en: 'Password and internet connection', fr: 'Mot de passe et connexion internet' },
    icon: 'wifi',
    category: 'essential',
    popularity: 99,
    tags: ['internet', 'contraseña', 'red']
  },
  {
    id: 'parking',
    name: { es: 'Aparcamiento', en: 'Parking', fr: 'Parking' },
    description: { es: 'Ubicación y normas de parking', en: 'Parking location and rules', fr: 'Emplacement et règles de stationnement' },
    icon: 'car',
    category: 'essential',
    popularity: 85,
    tags: ['parking', 'coche', 'plaza']
  },
  {
    id: 'directions',
    name: { es: 'Cómo llegar', en: 'How to get there', fr: 'Comment venir' },
    description: { es: 'Indicaciones desde aeropuerto, estación, etc.', en: 'Directions from airport, station, etc.', fr: 'Indications depuis l\'aéroport, la gare, etc.' },
    icon: 'navigation',
    category: 'essential',
    popularity: 95,
    tags: ['direcciones', 'transporte', 'ubicación']
  },
  {
    id: 'local-info',
    name: { es: 'Información local', en: 'Local information', fr: 'Informations locales' },
    description: { es: 'Horarios, moneda, idioma, voltaje, costumbres', en: 'Hours, currency, language, voltage, customs', fr: 'Horaires, monnaie, langue, voltage, coutumes' },
    icon: 'info',
    category: 'essential',
    popularity: 90,
    tags: ['ciudad', 'cultura', 'horarios']
  },

  // COMODIDADES (Amenities)
  {
    id: 'heating',
    name: { es: 'Calefacción', en: 'Heating', fr: 'Chauffage' },
    description: { es: 'Sistema de calefacción y termostato', en: 'Heating system and thermostat', fr: 'Système de chauffage et thermostat' },
    icon: 'thermometer',
    category: 'amenities',
    popularity: 80,
    tags: ['temperatura', 'calor', 'termostato']
  },
  {
    id: 'air-conditioning',
    name: { es: 'Aire acondicionado', en: 'Air conditioning', fr: 'Climatisation' },
    description: { es: 'Control del aire acondicionado', en: 'Air conditioning control', fr: 'Contrôle de la climatisation' },
    icon: 'wind',
    category: 'amenities',
    popularity: 75,
    tags: ['clima', 'frío', 'temperatura']
  },
  {
    id: 'washing-machine',
    name: { es: 'Lavadora', en: 'Washing machine', fr: 'Machine à laver' },
    description: { es: 'Instrucciones de uso de la lavadora', en: 'Washing machine instructions', fr: 'Instructions d\'utilisation de la machine à laver' },
    icon: 'washing-machine',
    category: 'amenities',
    popularity: 70,
    tags: ['lavar', 'ropa', 'detergente']
  },
  {
    id: 'dishwasher',
    name: { es: 'Lavavajillas', en: 'Dishwasher', fr: 'Lave-vaisselle' },
    description: { es: 'Cómo usar el lavavajillas', en: 'How to use the dishwasher', fr: 'Comment utiliser le lave-vaisselle' },
    icon: 'dishwasher',
    category: 'amenities',
    popularity: 65,
    tags: ['platos', 'cocina', 'limpieza']
  },
  {
    id: 'coffee-machine',
    name: { es: 'Cafetera', en: 'Coffee machine', fr: 'Machine à café' },
    description: { es: 'Tipo de cafetera y cápsulas', en: 'Coffee machine type and pods', fr: 'Type de machine à café et capsules' },
    icon: 'coffee',
    category: 'amenities',
    popularity: 72,
    tags: ['café', 'desayuno', 'cápsulas']
  },
  {
    id: 'tv',
    name: { es: 'Smart TV', en: 'Smart TV', fr: 'Smart TV' },
    description: { es: 'Canales y plataformas disponibles', en: 'Available channels and platforms', fr: 'Chaînes et plateformes disponibles' },
    icon: 'tv',
    category: 'amenities',
    popularity: 68,
    tags: ['televisión', 'netflix', 'entretenimiento']
  },
  {
    id: 'oven',
    name: { es: 'Horno', en: 'Oven', fr: 'Four' },
    description: { es: 'Instrucciones del horno', en: 'Oven instructions', fr: 'Instructions du four' },
    icon: 'oven',
    category: 'amenities',
    popularity: 60,
    tags: ['cocinar', 'cocina', 'temperatura']
  },
  {
    id: 'microwave',
    name: { es: 'Microondas', en: 'Microwave', fr: 'Micro-ondes' },
    description: { es: 'Uso del microondas', en: 'Microwave usage', fr: 'Utilisation du micro-ondes' },
    icon: 'microwave',
    category: 'amenities',
    popularity: 65,
    tags: ['calentar', 'cocina', 'rápido']
  },
  {
    id: 'induction',
    name: { es: 'Vitrocerámica', en: 'Cooktop', fr: 'Plaque de cuisson' },
    description: { es: 'Funcionamiento de la placa', en: 'How to use the cooktop', fr: 'Fonctionnement de la plaque' },
    icon: 'cooktop',
    category: 'amenities',
    popularity: 70,
    tags: ['cocinar', 'cocina', 'inducción']
  },

  // NORMAS (Rules)
  {
    id: 'house-rules',
    name: { es: 'Normas de la casa', en: 'House rules', fr: 'Règlement intérieur' },
    description: { es: 'Reglas generales del alojamiento', en: 'General accommodation rules', fr: 'Règles générales de l\'hébergement' },
    icon: 'rules',
    category: 'rules',
    popularity: 88,
    tags: ['normas', 'reglas', 'prohibido']
  },
  {
    id: 'quiet-hours',
    name: { es: 'Horario de silencio', en: 'Quiet hours', fr: 'Heures de silence' },
    description: { es: 'Horas de descanso y ruido', en: 'Rest hours and noise policy', fr: 'Heures de repos et bruit' },
    icon: 'volume-off',
    category: 'rules',
    popularity: 75,
    tags: ['silencio', 'ruido', 'vecinos']
  },
  {
    id: 'smoking',
    name: { es: 'Política de fumadores', en: 'Smoking policy', fr: 'Politique fumeur' },
    description: { es: 'Dónde se puede o no fumar', en: 'Where smoking is allowed or not', fr: 'Où fumer est autorisé ou non' },
    icon: 'smoking',
    category: 'rules',
    popularity: 80,
    tags: ['fumar', 'cigarrillos', 'prohibido']
  },
  {
    id: 'pets',
    name: { es: 'Mascotas', en: 'Pets', fr: 'Animaux' },
    description: { es: 'Política sobre animales', en: 'Pet policy', fr: 'Politique animaux' },
    icon: 'pet',
    category: 'rules',
    popularity: 65,
    tags: ['animales', 'perros', 'gatos']
  },
  {
    id: 'recycling',
    name: { es: 'Reciclaje', en: 'Recycling', fr: 'Recyclage' },
    description: { es: 'Sistema de separación de residuos', en: 'Waste separation system', fr: 'Système de tri des déchets' },
    icon: 'recycle',
    category: 'rules',
    popularity: 70,
    tags: ['basura', 'reciclaje', 'contenedores']
  },

  // INFORMACIÓN LOCAL (Local)
  {
    id: 'transport',
    name: { es: 'Transporte público', en: 'Public transport', fr: 'Transports en commun' },
    description: { es: 'Metro, bus, tranvía cercanos', en: 'Nearby metro, bus, tram', fr: 'Métro, bus, tramway à proximité' },
    icon: 'train',
    category: 'local',
    popularity: 85,
    tags: ['metro', 'bus', 'transporte']
  },
  {
    id: 'supermarket',
    name: { es: 'Supermercados', en: 'Supermarkets', fr: 'Supermarchés' },
    description: { es: 'Tiendas cercanas y horarios', en: 'Nearby stores and hours', fr: 'Magasins à proximité et horaires' },
    icon: 'shopping-cart',
    category: 'local',
    popularity: 82,
    tags: ['compras', 'comida', 'tiendas']
  },
  {
    id: 'restaurants',
    name: { es: 'Restaurantes recomendados', en: 'Recommended restaurants', fr: 'Restaurants recommandés' },
    description: { es: 'Mejores lugares para comer cerca', en: 'Best places to eat nearby', fr: 'Meilleurs endroits pour manger à proximité' },
    icon: 'restaurant',
    category: 'local',
    popularity: 78,
    tags: ['comer', 'restaurantes', 'comida']
  },
  {
    id: 'pharmacy',
    name: { es: 'Farmacias', en: 'Pharmacies', fr: 'Pharmacies' },
    description: { es: 'Farmacias cercanas y de guardia', en: 'Nearby and on-duty pharmacies', fr: 'Pharmacies à proximité et de garde' },
    icon: 'medical',
    category: 'local',
    popularity: 75,
    tags: ['farmacia', 'medicinas', 'salud']
  },
  {
    id: 'tourist-info',
    name: { es: 'Lugares de interés', en: 'Points of interest', fr: 'Points d\'intérêt' },
    description: { es: 'Sitios turísticos y actividades', en: 'Tourist sites and activities', fr: 'Sites touristiques et activités' },
    icon: 'landmark',
    category: 'local',
    popularity: 72,
    tags: ['turismo', 'visitas', 'monumentos']
  },

  // AHORRO (Savings)
  {
    id: 'save-transport',
    name: { es: '¿Cómo ahorrar en transporte?', en: 'How to save on transport?', fr: 'Comment économiser sur les transports ?' },
    description: { es: 'Bonos, tarjetas y trucos de transporte', en: 'Passes, cards and transport tips', fr: 'Pass, cartes et astuces transport' },
    icon: 'ticket',
    category: 'savings',
    popularity: 80,
    tags: ['ahorro', 'transporte', 'bonos']
  },
  {
    id: 'save-food',
    name: { es: '¿Cómo ahorrar en comida?', en: 'How to save on food?', fr: 'Comment économiser sur la nourriture ?' },
    description: { es: 'Mercados, ofertas y tips locales', en: 'Markets, deals and local tips', fr: 'Marchés, offres et astuces locales' },
    icon: 'piggy-bank',
    category: 'savings',
    popularity: 75,
    tags: ['ahorro', 'comida', 'mercados']
  },
  {
    id: 'save-activities',
    name: { es: '¿Cómo ahorrar en actividades?', en: 'How to save on activities?', fr: 'Comment économiser sur les activités ?' },
    description: { es: 'Días gratuitos, descuentos, etc.', en: 'Free days, discounts, etc.', fr: 'Jours gratuits, réductions, etc.' },
    icon: 'discount',
    category: 'savings',
    popularity: 70,
    tags: ['ahorro', 'gratis', 'descuentos']
  },

  // EMERGENCIAS (Emergency)
  {
    id: 'emergency-contacts',
    name: { es: 'Contactos de emergencia', en: 'Emergency contacts', fr: 'Contacts d\'urgence' },
    description: { es: 'Números importantes y protocolo', en: 'Important numbers and protocol', fr: 'Numéros importants et protocole' },
    icon: 'emergency',
    category: 'emergency',
    popularity: 95,
    tags: ['emergencia', 'teléfonos', 'urgencia']
  },
  {
    id: 'first-aid',
    name: { es: 'Botiquín', en: 'First aid kit', fr: 'Trousse de secours' },
    description: { es: 'Ubicación del botiquín', en: 'First aid kit location', fr: 'Emplacement de la trousse de secours' },
    icon: 'first-aid',
    category: 'emergency',
    popularity: 60,
    tags: ['botiquín', 'medicinas', 'primeros auxilios']
  },
  {
    id: 'electrical-panel',
    name: { es: 'Cuadro eléctrico', en: 'Electrical panel', fr: 'Tableau électrique' },
    description: { es: 'Ubicación y uso del diferencial', en: 'Location and use of circuit breaker', fr: 'Emplacement et utilisation du disjoncteur' },
    icon: 'electrical',
    category: 'emergency',
    popularity: 65,
    tags: ['electricidad', 'diferencial', 'luz']
  },
  {
    id: 'water-shut-off',
    name: { es: 'Llave de paso', en: 'Water shut-off', fr: 'Vanne d\'arrêt' },
    description: { es: 'Cómo cortar el agua', en: 'How to shut off water', fr: 'Comment couper l\'eau' },
    icon: 'water-off',
    category: 'emergency',
    popularity: 62,
    tags: ['agua', 'llave', 'emergencia']
  }
]

// Helper function to get text from multilingual object
export function getZoneTemplateText(value: MultilingualText | string | undefined, language: string = 'es', fallback: string = ''): string {
  if (!value) return fallback
  if (typeof value === 'string') return value
  return value[language as keyof MultilingualText] || value.es || fallback
}
