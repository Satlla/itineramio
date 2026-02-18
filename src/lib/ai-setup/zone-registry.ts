/**
 * Zone Registry — Central mapping between Vision canonical types,
 * zone templates, and smart placeholder defaults.
 */

// ============================================
// CANONICAL APPLIANCE TYPES
// ============================================

export const CANONICAL_APPLIANCE_TYPES = [
  'washing_machine',
  'dishwasher',
  'coffee_machine',
  'microwave',
  'oven',
  'induction_hob',
  'air_conditioning',
  'television',
  'refrigerator',
  'toaster',
  'kettle',
  'dryer',
  'iron',
  'safe',
  'heater',
] as const

export type CanonicalApplianceType = typeof CANONICAL_APPLIANCE_TYPES[number]

// ============================================
// CANONICAL ROOM TYPES
// ============================================

export const CANONICAL_ROOM_TYPES = [
  'kitchen',
  'bathroom',
  'bedroom',
  'living_room',
  'entrance',
  'terrace',
  'balcony',
  'garden',
  'pool',
  'parking',
  'laundry',
  'dining_room',
  'office',
  'gym',
  'exterior',
] as const

export type CanonicalRoomType = typeof CANONICAL_ROOM_TYPES[number]

// ============================================
// APPLIANCE → TEMPLATE MAPPING
// ============================================

export interface ApplianceRegistryEntry {
  templateId: string | null // null = no template, generate with AI
  icon: string
  nameEs: string
  nameEn: string
  nameFr: string
  descriptionEs: string
  descriptionEn: string
  descriptionFr: string
  placeholderDefaults: Record<string, string> // smart defaults for unfilled vars
}

export const APPLIANCE_REGISTRY: Record<CanonicalApplianceType, ApplianceRegistryEntry> = {
  washing_machine: {
    templateId: 'washing-machine',
    icon: 'washing-machine',
    nameEs: 'Lavadora',
    nameEn: 'Washing Machine',
    nameFr: 'Machine à laver',
    descriptionEs: 'Instrucciones de uso de la lavadora',
    descriptionEn: 'Washing machine instructions',
    descriptionFr: 'Instructions pour la machine à laver',
    placeholderDefaults: {
      '[UBICACIÓN]': 'dentro del apartamento. (💡 Especifica dónde está)',
      '[NÚMERO/NOMBRE]': 'el programa estándar (30-40°C)',
      '[X]': '60-90',
    },
  },
  dishwasher: {
    templateId: 'dishwasher',
    icon: 'dishwasher',
    nameEs: 'Lavavajillas',
    nameEn: 'Dishwasher',
    nameFr: 'Lave-vaisselle',
    descriptionEs: 'Cómo usar el lavavajillas',
    descriptionEn: 'How to use the dishwasher',
    descriptionFr: 'Comment utiliser le lave-vaisselle',
    placeholderDefaults: {
      '[UBICACIÓN]': 'en la cocina. (💡 Especifica dónde está)',
    },
  },
  coffee_machine: {
    templateId: 'coffee-machine',
    icon: 'coffee',
    nameEs: 'Cafetera',
    nameEn: 'Coffee Machine',
    nameFr: 'Machine à café',
    descriptionEs: 'Tipo de cafetera y cápsulas disponibles',
    descriptionEn: 'Coffee machine type and available capsules',
    descriptionFr: 'Type de cafetière et capsules disponibles',
    placeholderDefaults: {
      '[NESPRESSO/DOLCE GUSTO/ITALIANA/FILTRO]': 'de cápsulas. (💡 Especifica el tipo)',
      '[NESPRESSO/DOLCE GUSTO/ITALIAN/FILTER]': 'capsule machine. (💡 Specify type)',
      '[NESPRESSO/DOLCE GUSTO/ITALIENNE/FILTRE]': 'à capsules. (💡 Précisez le type)',
      '[UBICACIÓN]': 'en la cocina',
      '[LOCATION]': 'in the kitchen',
      '[EMPLACEMENT]': 'dans la cuisine',
      '[INSTRUCCIONES ESPECÍFICAS]': 'Inserta la cápsula y cierra la palanca',
      '[SPECIFIC INSTRUCTIONS]': 'Insert capsule and close the lever',
      '[INSTRUCTIONS SPÉCIFIQUES]': 'Insérez la capsule et fermez le levier',
    },
  },
  microwave: {
    templateId: null, // No pre-built template, but common appliance
    icon: 'microwave',
    nameEs: 'Microondas',
    nameEn: 'Microwave',
    nameFr: 'Micro-ondes',
    descriptionEs: 'Uso del microondas',
    descriptionEn: 'Microwave usage',
    descriptionFr: 'Utilisation du micro-ondes',
    placeholderDefaults: {},
  },
  oven: {
    templateId: null,
    icon: 'oven',
    nameEs: 'Horno',
    nameEn: 'Oven',
    nameFr: 'Four',
    descriptionEs: 'Instrucciones del horno',
    descriptionEn: 'Oven instructions',
    descriptionFr: 'Instructions du four',
    placeholderDefaults: {},
  },
  induction_hob: {
    templateId: null,
    icon: 'cooktop',
    nameEs: 'Vitrocerámica',
    nameEn: 'Cooktop',
    nameFr: 'Plaque de cuisson',
    descriptionEs: 'Funcionamiento de la placa de cocina',
    descriptionEn: 'How to use the cooktop',
    descriptionFr: 'Fonctionnement de la plaque de cuisson',
    placeholderDefaults: {},
  },
  air_conditioning: {
    templateId: 'air-conditioning',
    icon: 'wind',
    nameEs: 'Aire Acondicionado',
    nameEn: 'Air Conditioning',
    nameFr: 'Climatisation',
    descriptionEs: 'Control del aire acondicionado',
    descriptionEn: 'Air conditioning controls',
    descriptionFr: 'Contrôle de la climatisation',
    placeholderDefaults: {
      '[UBICACIÓN]': 'junto a la cama o en el salón. (💡 Especifica dónde está el mando)',
      '[LOCATION]': 'next to the bed or in the living room. (💡 Specify remote location)',
      '[EMPLACEMENT]': 'près du lit ou dans le salon. (💡 Précisez où se trouve la télécommande)',
    },
  },
  television: {
    templateId: null,
    icon: 'tv',
    nameEs: 'Smart TV',
    nameEn: 'Smart TV',
    nameFr: 'Smart TV',
    descriptionEs: 'Canales y plataformas disponibles',
    descriptionEn: 'Available channels and platforms',
    descriptionFr: 'Chaînes et plateformes disponibles',
    placeholderDefaults: {},
  },
  refrigerator: {
    templateId: null,
    icon: 'refrigerator',
    nameEs: 'Frigorífico',
    nameEn: 'Refrigerator',
    nameFr: 'Réfrigérateur',
    descriptionEs: 'Información sobre el frigorífico',
    descriptionEn: 'Refrigerator information',
    descriptionFr: 'Informations sur le réfrigérateur',
    placeholderDefaults: {},
  },
  toaster: {
    templateId: null,
    icon: 'cooking-pot',
    nameEs: 'Tostadora',
    nameEn: 'Toaster',
    nameFr: 'Grille-pain',
    descriptionEs: 'Uso de la tostadora',
    descriptionEn: 'Toaster usage',
    descriptionFr: 'Utilisation du grille-pain',
    placeholderDefaults: {},
  },
  kettle: {
    templateId: null,
    icon: 'coffee',
    nameEs: 'Hervidor',
    nameEn: 'Kettle',
    nameFr: 'Bouilloire',
    descriptionEs: 'Uso del hervidor de agua',
    descriptionEn: 'Kettle usage',
    descriptionFr: 'Utilisation de la bouilloire',
    placeholderDefaults: {},
  },
  dryer: {
    templateId: null,
    icon: 'wind',
    nameEs: 'Secadora',
    nameEn: 'Dryer',
    nameFr: 'Sèche-linge',
    descriptionEs: 'Instrucciones de la secadora',
    descriptionEn: 'Dryer instructions',
    descriptionFr: 'Instructions du sèche-linge',
    placeholderDefaults: {},
  },
  iron: {
    templateId: null,
    icon: 'iron',
    nameEs: 'Plancha',
    nameEn: 'Iron',
    nameFr: 'Fer à repasser',
    descriptionEs: 'Uso de la plancha',
    descriptionEn: 'Iron usage',
    descriptionFr: 'Utilisation du fer à repasser',
    placeholderDefaults: {},
  },
  safe: {
    templateId: null,
    icon: 'lock',
    nameEs: 'Caja Fuerte',
    nameEn: 'Safe',
    nameFr: 'Coffre-fort',
    descriptionEs: 'Uso de la caja fuerte',
    descriptionEn: 'Safe usage',
    descriptionFr: 'Utilisation du coffre-fort',
    placeholderDefaults: {},
  },
  heater: {
    templateId: null,
    icon: 'thermometer',
    nameEs: 'Calefacción',
    nameEn: 'Heating',
    nameFr: 'Chauffage',
    descriptionEs: 'Sistema de calefacción',
    descriptionEn: 'Heating system',
    descriptionFr: 'Système de chauffage',
    placeholderDefaults: {},
  },
}

// ============================================
// SYNONYM TABLE (for fallback normalization)
// ============================================

const APPLIANCE_SYNONYMS: Record<CanonicalApplianceType, string[]> = {
  washing_machine: ['washing machine', 'washer', 'laundry machine', 'clothes washer', 'lavadora'],
  dishwasher: ['dish washer', 'dish machine', 'lavavajillas'],
  coffee_machine: ['coffee maker', 'coffee machine', 'espresso machine', 'espresso maker', 'nespresso', 'dolce gusto', 'capsule machine', 'cafetera', 'moka pot', 'french press'],
  microwave: ['microwave oven', 'micro-wave', 'microondas'],
  oven: ['conventional oven', 'baking oven', 'wall oven', 'horno'],
  induction_hob: ['induction stove', 'induction cooktop', 'induction hob', 'ceramic cooktop', 'ceramic hob', 'electric cooktop', 'electric hob', 'electric stove', 'stovetop', 'hob', 'cooktop', 'stove top', 'vitroceramica', 'gas stove', 'gas cooktop', 'gas hob', 'burner'],
  air_conditioning: ['air conditioner', 'ac unit', 'ac remote', 'climate control', 'split unit', 'mini split', 'aire acondicionado', 'a/c'],
  television: ['tv', 'smart tv', 'television set', 'flatscreen', 'flat screen', 'monitor', 'screen', 'televisor'],
  refrigerator: ['fridge', 'freezer', 'fridge freezer', 'mini fridge', 'frigorífico', 'nevera', 'refrigerator'],
  toaster: ['bread toaster', 'tostadora', 'toaster oven'],
  kettle: ['electric kettle', 'water boiler', 'tea kettle', 'hervidor'],
  dryer: ['tumble dryer', 'clothes dryer', 'secadora'],
  iron: ['steam iron', 'ironing board', 'plancha'],
  safe: ['safety box', 'safe box', 'strongbox', 'caja fuerte'],
  heater: ['radiator', 'space heater', 'electric heater', 'calefactor', 'estufa', 'radiador'],
}

/**
 * Normalize a detected appliance label to a canonical type.
 * Returns null if no match found.
 */
export function normalizeAppliance(label: string): CanonicalApplianceType | null {
  const lower = label.toLowerCase().trim()

  // Direct match against canonical types (with underscores replaced)
  for (const type of CANONICAL_APPLIANCE_TYPES) {
    if (lower === type.replace(/_/g, ' ')) return type
  }

  // Synonym match
  for (const [canonical, synonyms] of Object.entries(APPLIANCE_SYNONYMS)) {
    for (const synonym of synonyms) {
      if (lower === synonym || lower.includes(synonym) || synonym.includes(lower)) {
        return canonical as CanonicalApplianceType
      }
    }
  }

  return null
}

// ============================================
// ROOM TYPE MAPPING
// ============================================

export const ROOM_NAMES: Record<CanonicalRoomType, { es: string; en: string; fr: string; icon: string }> = {
  kitchen: { es: 'Cocina', en: 'Kitchen', fr: 'Cuisine', icon: 'chef-hat' },
  bathroom: { es: 'Baño', en: 'Bathroom', fr: 'Salle de bain', icon: 'droplets' },
  bedroom: { es: 'Dormitorio', en: 'Bedroom', fr: 'Chambre', icon: 'bed' },
  living_room: { es: 'Salón', en: 'Living Room', fr: 'Salon', icon: 'sofa' },
  entrance: { es: 'Entrada', en: 'Entrance', fr: 'Entrée', icon: 'door-open' },
  terrace: { es: 'Terraza', en: 'Terrace', fr: 'Terrasse', icon: 'umbrella' },
  balcony: { es: 'Balcón', en: 'Balcony', fr: 'Balcon', icon: 'fence' },
  garden: { es: 'Jardín', en: 'Garden', fr: 'Jardin', icon: 'trees' },
  pool: { es: 'Piscina', en: 'Pool', fr: 'Piscine', icon: 'waves' },
  parking: { es: 'Parking', en: 'Parking', fr: 'Parking', icon: 'car' },
  laundry: { es: 'Lavandería', en: 'Laundry', fr: 'Buanderie', icon: 'shirt' },
  dining_room: { es: 'Comedor', en: 'Dining Room', fr: 'Salle à manger', icon: 'utensils' },
  office: { es: 'Despacho', en: 'Office', fr: 'Bureau', icon: 'monitor' },
  gym: { es: 'Gimnasio', en: 'Gym', fr: 'Salle de sport', icon: 'dumbbell' },
  exterior: { es: 'Exterior', en: 'Exterior', fr: 'Extérieur', icon: 'trees' },
}

// ============================================
// EMERGENCY NUMBERS BY COUNTRY
// ============================================

export const EMERGENCY_NUMBERS: Record<string, { general: string; police?: string; medical?: string; fire?: string }> = {
  // Europe
  ES: { general: '112', police: '091', medical: '061', fire: '080' },
  FR: { general: '112', medical: '15', police: '17', fire: '18' },
  IT: { general: '112', medical: '118', police: '113', fire: '115' },
  DE: { general: '112', police: '110' },
  PT: { general: '112' },
  GB: { general: '999', police: '101' },
  NL: { general: '112' },
  BE: { general: '112' },
  AT: { general: '112', police: '133', fire: '122', medical: '144' },
  CH: { general: '112', police: '117', fire: '118', medical: '144' },
  GR: { general: '112', police: '100', medical: '166', fire: '199' },
  HR: { general: '112' },
  CZ: { general: '112', police: '158', medical: '155', fire: '150' },
  PL: { general: '112', police: '997', medical: '999', fire: '998' },
  SE: { general: '112' },
  NO: { general: '112', police: '02800' },
  DK: { general: '112' },
  FI: { general: '112' },
  IE: { general: '112' },
  // Americas
  US: { general: '911' },
  CA: { general: '911' },
  MX: { general: '911' },
  BR: { general: '190', medical: '192', fire: '193' },
  AR: { general: '911', medical: '107', fire: '100' },
  CO: { general: '123' },
  CL: { general: '131', police: '133', fire: '132' },
  PE: { general: '105', medical: '116', fire: '116' },
  // Asia
  JP: { general: '110', medical: '119', fire: '119' },
  CN: { general: '110', medical: '120', fire: '119' },
  KR: { general: '112', medical: '119', fire: '119' },
  TH: { general: '191', medical: '1669' },
  IN: { general: '112' },
  // Oceania
  AU: { general: '000' },
  NZ: { general: '111' },
  // Middle East
  AE: { general: '999', police: '999', medical: '998' },
  TR: { general: '112', police: '155', medical: '112', fire: '110' },
  // Africa
  ZA: { general: '10111', medical: '10177' },
  MA: { general: '19', medical: '15', fire: '15' },
  EG: { general: '122', medical: '123' },
}

/**
 * Get emergency info for a country. Falls back to generic 112.
 */
export function getEmergencyNumbers(countryCode: string): { general: string; police?: string; medical?: string; fire?: string } {
  return EMERGENCY_NUMBERS[countryCode.toUpperCase()] || { general: '112' }
}

/**
 * Resolve country name to ISO code.
 */
export function resolveCountryCode(countryName: string): string {
  const map: Record<string, string> = {
    'españa': 'ES', 'spain': 'ES',
    'francia': 'FR', 'france': 'FR',
    'italia': 'IT', 'italy': 'IT',
    'alemania': 'DE', 'germany': 'DE',
    'portugal': 'PT',
    'reino unido': 'GB', 'united kingdom': 'GB', 'uk': 'GB',
    'estados unidos': 'US', 'united states': 'US', 'usa': 'US',
    'canadá': 'CA', 'canada': 'CA',
    'méxico': 'MX', 'mexico': 'MX',
    'brasil': 'BR', 'brazil': 'BR',
    'argentina': 'AR',
    'colombia': 'CO',
    'chile': 'CL',
    'perú': 'PE', 'peru': 'PE',
    'japón': 'JP', 'japan': 'JP',
    'china': 'CN',
    'australia': 'AU',
    'países bajos': 'NL', 'netherlands': 'NL', 'holanda': 'NL',
    'bélgica': 'BE', 'belgium': 'BE',
    'austria': 'AT',
    'suiza': 'CH', 'switzerland': 'CH',
    'grecia': 'GR', 'greece': 'GR',
    'croacia': 'HR', 'croatia': 'HR',
    'turquía': 'TR', 'turkey': 'TR', 'türkiye': 'TR',
    'marruecos': 'MA', 'morocco': 'MA',
    'tailandia': 'TH', 'thailand': 'TH',
    'india': 'IN',
    'corea del sur': 'KR', 'south korea': 'KR',
    'nueva zelanda': 'NZ', 'new zealand': 'NZ',
    'emiratos árabes unidos': 'AE', 'united arab emirates': 'AE',
    'sudáfrica': 'ZA', 'south africa': 'ZA',
    'egipto': 'EG', 'egypt': 'EG',
    'suecia': 'SE', 'sweden': 'SE',
    'noruega': 'NO', 'norway': 'NO',
    'dinamarca': 'DK', 'denmark': 'DK',
    'finlandia': 'FI', 'finland': 'FI',
    'irlanda': 'IE', 'ireland': 'IE',
    'república checa': 'CZ', 'czech republic': 'CZ', 'czechia': 'CZ',
    'polonia': 'PL', 'poland': 'PL',
  }
  return map[countryName.toLowerCase()] || 'ES'
}

// ============================================
// APPLIANCE CONTENT GENERATION (for types without template)
// ============================================

/**
 * Generate basic content for appliances without a pre-built template.
 * Uses smart defaults instead of calling Claude.
 */
export function generateBasicApplianceContent(type: CanonicalApplianceType): {
  steps: Array<{ es: string; en: string; fr: string; titleEs: string; titleEn: string; titleFr: string }>
} {
  const contents: Record<string, ReturnType<typeof generateBasicApplianceContent>> = {
    microwave: {
      steps: [{
        titleEs: 'Microondas', titleEn: 'Microwave', titleFr: 'Micro-ondes',
        es: `📍 **Ubicación:** En la cocina\n\n**Uso:** 1. Coloca el recipiente dentro (no uses metal)\n2. Selecciona la potencia y el tiempo\n3. Pulsa START\n\n⚠️ **No calientes recipientes metálicos ni papel de aluminio.**`,
        en: `📍 **Location:** In the kitchen\n\n**Usage:** 1. Place container inside (no metal)\n2. Select power and time\n3. Press START\n\n⚠️ **Do not heat metal containers or aluminum foil.**`,
        fr: `📍 **Emplacement:** Dans la cuisine\n\n**Utilisation:** 1. Placez le récipient à l'intérieur (pas de métal)\n2. Sélectionnez la puissance et le temps\n3. Appuyez sur START\n\n⚠️ **Ne chauffez pas de récipients métalliques ni de papier aluminium.**`,
      }],
    },
    oven: {
      steps: [{
        titleEs: 'Horno', titleEn: 'Oven', titleFr: 'Four',
        es: `📍 **Ubicación:** En la cocina\n\n**Uso:** 1. Gira el selector de temperatura (180-200°C es lo más común)\n2. Selecciona el modo (arriba/abajo para la mayoría de recetas)\n3. Espera a que se precaliente (~10 min)\n4. Introduce tu plato\n\n⚠️ **Usa siempre guantes para sacar las bandejas. Apaga al terminar.**`,
        en: `📍 **Location:** In the kitchen\n\n**Usage:** 1. Turn temperature dial (180-200°C / 350-400°F is most common)\n2. Select mode (top/bottom heat for most recipes)\n3. Wait for preheating (~10 min)\n4. Place your dish inside\n\n⚠️ **Always use oven mitts to remove trays. Turn off when done.**`,
        fr: `📍 **Emplacement:** Dans la cuisine\n\n**Utilisation:** 1. Tournez le sélecteur de température (180-200°C le plus courant)\n2. Sélectionnez le mode (chaleur haut/bas pour la plupart des recettes)\n3. Attendez le préchauffage (~10 min)\n4. Placez votre plat\n\n⚠️ **Utilisez toujours des gants pour retirer les plaques. Éteignez après utilisation.**`,
      }],
    },
    induction_hob: {
      steps: [{
        titleEs: 'Vitrocerámica', titleEn: 'Cooktop', titleFr: 'Plaque de cuisson',
        es: `📍 **Ubicación:** En la cocina\n\n**Encender:** 1. Pulsa el botón de encendido\n2. Selecciona el fuego que quieras usar\n3. Ajusta la potencia con + y -\n\n🔒 **Si aparece "LO" en la pantalla:** Es el bloqueo infantil. Mantén pulsado el icono del candado 🔒 durante 3-5 segundos para desbloquearlo.\n\n⚠️ **Usa solo sartenes y ollas compatibles con inducción (base magnética).**`,
        en: `📍 **Location:** In the kitchen\n\n**To turn on:** 1. Press the power button\n2. Select the burner you want to use\n3. Adjust power with + and -\n\n🔒 **If "LO" appears on display:** This is the child lock. Press and hold the lock icon 🔒 for 3-5 seconds to unlock.\n\n⚠️ **Only use induction-compatible pans and pots (magnetic base).**`,
        fr: `📍 **Emplacement:** Dans la cuisine\n\n**Pour allumer:** 1. Appuyez sur le bouton marche\n2. Sélectionnez le foyer souhaité\n3. Réglez la puissance avec + et -\n\n🔒 **Si "LO" apparaît à l'écran:** C'est la sécurité enfant. Maintenez l'icône cadenas 🔒 pendant 3-5 secondes pour déverrouiller.\n\n⚠️ **Utilisez uniquement des casseroles compatibles induction (fond magnétique).**`,
      }],
    },
    television: {
      steps: [{
        titleEs: 'Smart TV', titleEn: 'Smart TV', titleFr: 'Smart TV',
        es: `📺 **Mando a distancia:** Junto al sofá o en el mueble del TV\n\n**Encender:** Pulsa el botón rojo de encendido\n\n**Apps disponibles:** Netflix, YouTube, Prime Video (💡 Usa tu propia cuenta)\n\n**Canales:** Usa el botón de canales para navegar por la TDT\n\n⚠️ **Por favor, cierra sesión de tus cuentas al hacer check-out.**`,
        en: `📺 **Remote control:** Next to the sofa or on the TV cabinet\n\n**Turn on:** Press the red power button\n\n**Available apps:** Netflix, YouTube, Prime Video (💡 Use your own account)\n\n**Channels:** Use channel buttons to browse local TV\n\n⚠️ **Please log out of your accounts at check-out.**`,
        fr: `📺 **Télécommande:** Près du canapé ou sur le meuble TV\n\n**Allumer:** Appuyez sur le bouton rouge\n\n**Apps disponibles:** Netflix, YouTube, Prime Video (💡 Utilisez votre propre compte)\n\n**Chaînes:** Utilisez les boutons de chaînes pour la TNT\n\n⚠️ **Merci de vous déconnecter de vos comptes au départ.**`,
      }],
    },
    refrigerator: {
      steps: [{
        titleEs: 'Frigorífico', titleEn: 'Refrigerator', titleFr: 'Réfrigérateur',
        es: `📍 **Ubicación:** En la cocina\n\n**Uso libre:** Puedes usar toda la nevera para tus alimentos durante tu estancia.\n\n❄️ **Congelador:** Disponible en la parte superior/inferior\n\n⚠️ **Retira tus alimentos antes del check-out.**`,
        en: `📍 **Location:** In the kitchen\n\n**Free to use:** You can use the entire fridge for your food during your stay.\n\n❄️ **Freezer:** Available at the top/bottom\n\n⚠️ **Remove your food before check-out.**`,
        fr: `📍 **Emplacement:** Dans la cuisine\n\n**Utilisation libre:** Vous pouvez utiliser tout le réfrigérateur pour vos aliments pendant votre séjour.\n\n❄️ **Congélateur:** Disponible en haut/en bas\n\n⚠️ **Retirez vos aliments avant le départ.**`,
      }],
    },
    toaster: {
      steps: [{
        titleEs: 'Tostadora', titleEn: 'Toaster', titleFr: 'Grille-pain',
        es: `📍 **Ubicación:** En la cocina\n\n**Uso:** 1. Introduce el pan\n2. Selecciona la intensidad\n3. Baja la palanca\n\n⚠️ **No introduzcas cubiertos metálicos dentro.**`,
        en: `📍 **Location:** In the kitchen\n\n**Usage:** 1. Insert bread\n2. Select intensity\n3. Push lever down\n\n⚠️ **Do not insert metal utensils inside.**`,
        fr: `📍 **Emplacement:** Dans la cuisine\n\n**Utilisation:** 1. Insérez le pain\n2. Sélectionnez l'intensité\n3. Abaissez le levier\n\n⚠️ **N'insérez pas de couverts métalliques à l'intérieur.**`,
      }],
    },
    kettle: {
      steps: [{
        titleEs: 'Hervidor', titleEn: 'Kettle', titleFr: 'Bouilloire',
        es: `📍 **Ubicación:** En la cocina\n\n**Uso:** 1. Llena con agua hasta la marca MAX\n2. Coloca en la base\n3. Pulsa el interruptor\n4. Espera a que hierva (~2-3 min)\n\n⚠️ **No enciendas sin agua.**`,
        en: `📍 **Location:** In the kitchen\n\n**Usage:** 1. Fill with water up to MAX line\n2. Place on base\n3. Press switch\n4. Wait for boiling (~2-3 min)\n\n⚠️ **Do not turn on without water.**`,
        fr: `📍 **Emplacement:** Dans la cuisine\n\n**Utilisation:** 1. Remplissez d'eau jusqu'au repère MAX\n2. Placez sur la base\n3. Appuyez sur l'interrupteur\n4. Attendez l'ébullition (~2-3 min)\n\n⚠️ **Ne l'allumez pas sans eau.**`,
      }],
    },
    dryer: {
      steps: [{
        titleEs: 'Secadora', titleEn: 'Dryer', titleFr: 'Sèche-linge',
        es: `📍 **Ubicación:** Junto a la lavadora\n\n**Uso:** 1. Introduce la ropa húmeda (no sobrecargues)\n2. Limpia el filtro de pelusas antes de cada uso\n3. Selecciona el programa (Normal o Delicado)\n4. Pulsa inicio\n\n⚠️ **Limpia siempre el filtro de pelusas.**`,
        en: `📍 **Location:** Next to the washing machine\n\n**Usage:** 1. Load wet clothes (don't overload)\n2. Clean lint filter before each use\n3. Select program (Normal or Delicate)\n4. Press start\n\n⚠️ **Always clean the lint filter.**`,
        fr: `📍 **Emplacement:** À côté de la machine à laver\n\n**Utilisation:** 1. Chargez le linge humide (ne surchargez pas)\n2. Nettoyez le filtre à peluches avant chaque utilisation\n3. Sélectionnez le programme (Normal ou Délicat)\n4. Appuyez sur démarrer\n\n⚠️ **Nettoyez toujours le filtre à peluches.**`,
      }],
    },
    iron: {
      steps: [{
        titleEs: 'Plancha', titleEn: 'Iron', titleFr: 'Fer à repasser',
        es: `📍 **Ubicación:** En el armario. (💡 Especifica dónde)\n\n**Uso:** 1. Llena el depósito de agua\n2. Conecta y espera a que caliente\n3. Selecciona la temperatura según el tejido\n\n⚠️ **Desconecta siempre al terminar. No dejes sobre la ropa.**`,
        en: `📍 **Location:** In the closet. (💡 Specify where)\n\n**Usage:** 1. Fill water tank\n2. Plug in and wait to heat up\n3. Select temperature for fabric type\n\n⚠️ **Always unplug when done. Don't leave on clothes.**`,
        fr: `📍 **Emplacement:** Dans le placard. (💡 Précisez où)\n\n**Utilisation:** 1. Remplissez le réservoir d'eau\n2. Branchez et attendez le chauffage\n3. Sélectionnez la température selon le tissu\n\n⚠️ **Débranchez toujours après utilisation. Ne laissez pas sur les vêtements.**`,
      }],
    },
    safe: {
      steps: [{
        titleEs: 'Caja Fuerte', titleEn: 'Safe', titleFr: 'Coffre-fort',
        es: `📍 **Ubicación:** En el armario del dormitorio. (💡 Especifica dónde)\n\n**Uso:** 1. Abre la puerta\n2. Introduce tus objetos de valor\n3. Establece un código de 4-6 dígitos\n4. Cierra la puerta y gira la manija\n\n⚠️ **Recuerda tu código. Vacía la caja antes del check-out.**`,
        en: `📍 **Location:** In the bedroom closet. (💡 Specify where)\n\n**Usage:** 1. Open the door\n2. Place your valuables inside\n3. Set a 4-6 digit code\n4. Close door and turn handle\n\n⚠️ **Remember your code. Empty before check-out.**`,
        fr: `📍 **Emplacement:** Dans le placard de la chambre. (💡 Précisez où)\n\n**Utilisation:** 1. Ouvrez la porte\n2. Placez vos objets de valeur\n3. Définissez un code à 4-6 chiffres\n4. Fermez la porte et tournez la poignée\n\n⚠️ **Rappelez-vous votre code. Videz avant le départ.**`,
      }],
    },
    heater: {
      steps: [{
        titleEs: 'Calefacción', titleEn: 'Heating', titleFr: 'Chauffage',
        es: `🌡️ **Tipo:** Radiador eléctrico / Central. (💡 Especifica el tipo)\n\n**Encender:** 1. Pulsa el botón de encendido\n2. Ajusta la temperatura a 20-22°C\n3. Espera unos minutos a que caliente\n\n⚠️ **Apaga al salir. No cubras los radiadores con ropa.**`,
        en: `🌡️ **Type:** Electric radiator / Central. (💡 Specify type)\n\n**Turn on:** 1. Press power button\n2. Set temperature to 20-22°C / 68-72°F\n3. Wait a few minutes to warm up\n\n⚠️ **Turn off when leaving. Don't cover radiators with clothes.**`,
        fr: `🌡️ **Type:** Radiateur électrique / Central. (💡 Précisez le type)\n\n**Allumer:** 1. Appuyez sur le bouton marche\n2. Réglez la température à 20-22°C\n3. Attendez quelques minutes\n\n⚠️ **Éteignez en partant. Ne couvrez pas les radiateurs avec des vêtements.**`,
      }],
    },
  }

  return contents[type] || { steps: [] }
}
