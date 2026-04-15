export interface Amenity {
  id: string
  name: { es: string; en: string; fr: string }
  category: string
  icon: string
}

export interface AmenityCategory {
  id: string
  name: { es: string; en: string; fr: string }
  amenities: Amenity[]
}

const AMENITIES: Amenity[] = [
  // Baño
  { id: 'hair_dryer', name: { es: 'Secador de pelo', en: 'Hair dryer', fr: 'Sèche-cheveux' }, category: 'bathroom', icon: 'wind' },
  { id: 'shampoo', name: { es: 'Champú', en: 'Shampoo', fr: 'Shampooing' }, category: 'bathroom', icon: 'droplets' },
  { id: 'conditioner', name: { es: 'Acondicionador', en: 'Conditioner', fr: 'Après-shampooing' }, category: 'bathroom', icon: 'pipette' },
  { id: 'body_wash', name: { es: 'Gel de ducha', en: 'Body wash', fr: 'Gel douche' }, category: 'bathroom', icon: 'shower-head' },
  { id: 'hot_water', name: { es: 'Agua caliente', en: 'Hot water', fr: 'Eau chaude' }, category: 'bathroom', icon: 'thermometer' },
  { id: 'cleaning_products', name: { es: 'Productos de limpieza', en: 'Cleaning products', fr: 'Produits de nettoyage' }, category: 'bathroom', icon: 'sparkles' },
  { id: 'towels', name: { es: 'Toallas', en: 'Towels', fr: 'Serviettes' }, category: 'bathroom', icon: 'scroll' },
  { id: 'bidet', name: { es: 'Bidé', en: 'Bidet', fr: 'Bidet' }, category: 'bathroom', icon: 'glass-water' },

  // Dormitorio y lavandería
  { id: 'bed_linens', name: { es: 'Ropa de cama', en: 'Bed linens', fr: 'Linge de lit' }, category: 'bedroom', icon: 'bed-double' },
  { id: 'extra_blankets', name: { es: 'Almohadas y mantas extra', en: 'Extra pillows and blankets', fr: 'Oreillers et couvertures supplémentaires' }, category: 'bedroom', icon: 'bed' },
  { id: 'blackout_curtains', name: { es: 'Persianas o cortinas opacas', en: 'Blackout curtains', fr: 'Rideaux occultants' }, category: 'bedroom', icon: 'moon' },
  { id: 'iron', name: { es: 'Plancha', en: 'Iron', fr: 'Fer à repasser' }, category: 'bedroom', icon: 'shirt' },
  { id: 'ironing_board', name: { es: 'Tabla de planchar', en: 'Ironing board', fr: 'Table à repasser' }, category: 'bedroom', icon: 'rectangle-horizontal' },
  { id: 'wardrobe', name: { es: 'Armario', en: 'Wardrobe', fr: 'Armoire' }, category: 'bedroom', icon: 'door-closed' },
  { id: 'dresser', name: { es: 'Cómoda', en: 'Dresser', fr: 'Commode' }, category: 'bedroom', icon: 'archive' },
  { id: 'clothes_rack', name: { es: 'Tendedero', en: 'Clothes rack', fr: 'Étendoir' }, category: 'bedroom', icon: 'grip-horizontal' },
  { id: 'washer', name: { es: 'Lavadora', en: 'Washing machine', fr: 'Machine à laver' }, category: 'bedroom', icon: 'rotate-cw' },
  { id: 'dryer', name: { es: 'Secadora', en: 'Dryer', fr: 'Sèche-linge' }, category: 'bedroom', icon: 'wind' },
  { id: 'crib', name: { es: 'Cuna', en: 'Crib', fr: 'Lit bébé' }, category: 'bedroom', icon: 'baby' },
  { id: 'high_chair', name: { es: 'Trona', en: 'High chair', fr: 'Chaise haute' }, category: 'bedroom', icon: 'armchair' },

  // Cocina y comedor
  { id: 'kitchen', name: { es: 'Cocina', en: 'Kitchen', fr: 'Cuisine' }, category: 'kitchen', icon: 'chef-hat' },
  { id: 'fridge', name: { es: 'Nevera', en: 'Refrigerator', fr: 'Réfrigérateur' }, category: 'kitchen', icon: 'refrigerator' },
  { id: 'freezer', name: { es: 'Congelador', en: 'Freezer', fr: 'Congélateur' }, category: 'kitchen', icon: 'snowflake' },
  { id: 'microwave', name: { es: 'Microondas', en: 'Microwave', fr: 'Micro-ondes' }, category: 'kitchen', icon: 'microwave' },
  { id: 'oven', name: { es: 'Horno', en: 'Oven', fr: 'Four' }, category: 'kitchen', icon: 'flame' },
  { id: 'stove', name: { es: 'Vitrocerámica', en: 'Stove', fr: 'Plaque de cuisson' }, category: 'kitchen', icon: 'circle-dot' },
  { id: 'dishwasher', name: { es: 'Lavavajillas', en: 'Dishwasher', fr: 'Lave-vaisselle' }, category: 'kitchen', icon: 'glass-water' },
  { id: 'coffee_maker', name: { es: 'Cafetera', en: 'Coffee maker', fr: 'Cafetière' }, category: 'kitchen', icon: 'coffee' },
  { id: 'kettle', name: { es: 'Hervidor de agua', en: 'Kettle', fr: 'Bouilloire' }, category: 'kitchen', icon: 'cup-soda' },
  { id: 'toaster', name: { es: 'Tostadora', en: 'Toaster', fr: 'Grille-pain' }, category: 'kitchen', icon: 'sandwich' },
  { id: 'cooking_basics', name: { es: 'Utensilios básicos de cocina', en: 'Cooking basics', fr: 'Ustensiles de cuisine' }, category: 'kitchen', icon: 'utensils' },
  { id: 'dishes', name: { es: 'Platos y cubiertos', en: 'Dishes and silverware', fr: 'Vaisselle et couverts' }, category: 'kitchen', icon: 'soup' },
  { id: 'dining_table', name: { es: 'Mesa de comedor', en: 'Dining table', fr: 'Table à manger' }, category: 'kitchen', icon: 'table-2' },

  // Ocio
  { id: 'tv', name: { es: 'Televisión', en: 'TV', fr: 'Télévision' }, category: 'entertainment', icon: 'tv' },
  { id: 'books', name: { es: 'Libros', en: 'Books', fr: 'Livres' }, category: 'entertainment', icon: 'book-open' },
  { id: 'board_games', name: { es: 'Juegos de mesa', en: 'Board games', fr: 'Jeux de société' }, category: 'entertainment', icon: 'puzzle' },

  // Calefacción y refrigeración
  { id: 'ac', name: { es: 'Aire acondicionado', en: 'Air conditioning', fr: 'Climatisation' }, category: 'climate', icon: 'snowflake' },
  { id: 'heating', name: { es: 'Calefacción', en: 'Heating', fr: 'Chauffage' }, category: 'climate', icon: 'flame' },
  { id: 'ceiling_fan', name: { es: 'Ventilador de techo', en: 'Ceiling fan', fr: 'Ventilateur de plafond' }, category: 'climate', icon: 'fan' },
  { id: 'portable_fan', name: { es: 'Ventilador portátil', en: 'Portable fan', fr: 'Ventilateur portable' }, category: 'climate', icon: 'fan' },

  // Internet y oficina
  { id: 'wifi', name: { es: 'WiFi', en: 'WiFi', fr: 'WiFi' }, category: 'office', icon: 'wifi' },
  { id: 'workspace', name: { es: 'Zona de trabajo', en: 'Workspace', fr: 'Espace de travail' }, category: 'office', icon: 'lamp-desk' },

  // Seguridad
  { id: 'smoke_detector', name: { es: 'Detector de humo', en: 'Smoke detector', fr: 'Détecteur de fumée' }, category: 'safety', icon: 'alarm-check' },
  { id: 'co_detector', name: { es: 'Detector de monóxido de carbono', en: 'Carbon monoxide detector', fr: 'Détecteur de monoxyde de carbone' }, category: 'safety', icon: 'shield-check' },
  { id: 'first_aid', name: { es: 'Botiquín', en: 'First aid kit', fr: 'Trousse de secours' }, category: 'safety', icon: 'cross' },
  { id: 'fire_extinguisher', name: { es: 'Extintor', en: 'Fire extinguisher', fr: 'Extincteur' }, category: 'safety', icon: 'flame-kindling' },
  { id: 'safe', name: { es: 'Caja fuerte', en: 'Safe', fr: 'Coffre-fort' }, category: 'safety', icon: 'lock' },
  { id: 'bedroom_lock', name: { es: 'Cerradura en el dormitorio', en: 'Bedroom lock', fr: 'Serrure de chambre' }, category: 'safety', icon: 'lock-keyhole' },

  // Aparcamiento e instalaciones
  { id: 'free_parking', name: { es: 'Parking gratuito', en: 'Free parking', fr: 'Parking gratuit' }, category: 'facilities', icon: 'parking-circle' },
  { id: 'paid_parking', name: { es: 'Parking de pago', en: 'Paid parking', fr: 'Parking payant' }, category: 'facilities', icon: 'car' },
  { id: 'elevator', name: { es: 'Ascensor', en: 'Elevator', fr: 'Ascenseur' }, category: 'facilities', icon: 'arrow-up-from-line' },
  { id: 'smart_lock', name: { es: 'Cerradura inteligente', en: 'Smart lock', fr: 'Serrure intelligente' }, category: 'facilities', icon: 'key' },

  // Exterior
  { id: 'pool', name: { es: 'Piscina', en: 'Pool', fr: 'Piscine' }, category: 'outdoor', icon: 'waves' },
  { id: 'jacuzzi', name: { es: 'Jacuzzi', en: 'Hot tub', fr: 'Jacuzzi' }, category: 'outdoor', icon: 'bath' },
  { id: 'terrace', name: { es: 'Terraza', en: 'Terrace', fr: 'Terrasse' }, category: 'outdoor', icon: 'umbrella' },
  { id: 'garden', name: { es: 'Jardín', en: 'Garden', fr: 'Jardin' }, category: 'outdoor', icon: 'tree-pine' },
  { id: 'bbq', name: { es: 'Barbacoa', en: 'BBQ', fr: 'Barbecue' }, category: 'outdoor', icon: 'beef' },
  { id: 'balcony', name: { es: 'Balcón', en: 'Balcony', fr: 'Balcon' }, category: 'outdoor', icon: 'sun' },
  { id: 'patio', name: { es: 'Patio', en: 'Patio', fr: 'Patio' }, category: 'outdoor', icon: 'layout-grid' },

  // Servicios
  { id: 'long_stays', name: { es: 'Estancias largas', en: 'Long stays', fr: 'Longs séjours' }, category: 'services', icon: 'calendar' },
  { id: 'self_checkin', name: { es: 'Llegada autónoma', en: 'Self check-in', fr: 'Arrivée autonome' }, category: 'services', icon: 'door-open' },
  { id: 'pets_allowed', name: { es: 'Se admiten mascotas', en: 'Pets allowed', fr: 'Animaux acceptés' }, category: 'services', icon: 'paw-print' },
]

export const AMENITY_CATEGORIES: AmenityCategory[] = [
  { id: 'bathroom', name: { es: 'Baño', en: 'Bathroom', fr: 'Salle de bain' }, amenities: AMENITIES.filter(a => a.category === 'bathroom') },
  { id: 'bedroom', name: { es: 'Dormitorio y lavandería', en: 'Bedroom & laundry', fr: 'Chambre et buanderie' }, amenities: AMENITIES.filter(a => a.category === 'bedroom') },
  { id: 'kitchen', name: { es: 'Cocina y comedor', en: 'Kitchen & dining', fr: 'Cuisine et salle à manger' }, amenities: AMENITIES.filter(a => a.category === 'kitchen') },
  { id: 'entertainment', name: { es: 'Ocio', en: 'Entertainment', fr: 'Divertissement' }, amenities: AMENITIES.filter(a => a.category === 'entertainment') },
  { id: 'climate', name: { es: 'Calefacción y refrigeración', en: 'Heating & cooling', fr: 'Chauffage et climatisation' }, amenities: AMENITIES.filter(a => a.category === 'climate') },
  { id: 'office', name: { es: 'Internet y oficina', en: 'Internet & office', fr: 'Internet et bureau' }, amenities: AMENITIES.filter(a => a.category === 'office') },
  { id: 'safety', name: { es: 'Seguridad', en: 'Safety', fr: 'Sécurité' }, amenities: AMENITIES.filter(a => a.category === 'safety') },
  { id: 'facilities', name: { es: 'Instalaciones', en: 'Facilities', fr: 'Installations' }, amenities: AMENITIES.filter(a => a.category === 'facilities') },
  { id: 'outdoor', name: { es: 'Exterior', en: 'Outdoor', fr: 'Extérieur' }, amenities: AMENITIES.filter(a => a.category === 'outdoor') },
  { id: 'services', name: { es: 'Servicios', en: 'Services', fr: 'Services' }, amenities: AMENITIES.filter(a => a.category === 'services') },
]

export const ALL_AMENITIES = AMENITIES

export function getAmenityById(id: string): Amenity | undefined {
  return AMENITIES.find(a => a.id === id)
}

// Map Airbnb amenity strings to our amenity IDs
const AIRBNB_MAPPING: Record<string, string> = {
  'secador de pelo': 'hair_dryer', 'hair dryer': 'hair_dryer', 'hairdryer': 'hair_dryer',
  'champú': 'shampoo', 'shampoo': 'shampoo',
  'acondicionador': 'conditioner', 'conditioner': 'conditioner',
  'gel de ducha': 'body_wash', 'body wash': 'body_wash',
  'agua caliente': 'hot_water', 'hot water': 'hot_water',
  'productos de limpieza': 'cleaning_products', 'cleaning products': 'cleaning_products',
  'toallas': 'towels', 'towels': 'towels',
  'ropa de cama': 'bed_linens', 'bed linens': 'bed_linens',
  'almohadas y mantas adicionales': 'extra_blankets', 'extra pillows and blankets': 'extra_blankets', 'almohadas y mantas extra': 'extra_blankets',
  'persianas o cortinas opacas': 'blackout_curtains', 'blackout curtains': 'blackout_curtains',
  'plancha': 'iron', 'iron': 'iron',
  'tabla de planchar': 'ironing_board', 'ironing board': 'ironing_board',
  'tendedero para ropa': 'clothes_rack', 'tendedero': 'clothes_rack',
  'lavadora': 'washer', 'washing machine': 'washer', 'washer': 'washer',
  'secadora': 'dryer', 'dryer': 'dryer',
  'cuna': 'crib', 'crib': 'crib',
  'trona': 'high_chair', 'high chair': 'high_chair',
  'cocina': 'kitchen', 'kitchen': 'kitchen',
  'nevera': 'fridge', 'refrigerator': 'fridge', 'frigorífico': 'fridge',
  'congelador': 'freezer', 'freezer': 'freezer',
  'microondas': 'microwave', 'microwave': 'microwave',
  'horno': 'oven', 'oven': 'oven',
  'vitrocerámica': 'stove', 'cocina eléctrica': 'stove', 'stove': 'stove', 'induction': 'stove',
  'lavavajillas': 'dishwasher', 'dishwasher': 'dishwasher',
  'cafetera': 'coffee_maker', 'coffee maker': 'coffee_maker', 'coffee machine': 'coffee_maker',
  'hervidor de agua': 'kettle', 'kettle': 'kettle',
  'tostadora': 'toaster', 'toaster': 'toaster',
  'utensilios básicos de cocina': 'cooking_basics', 'cooking basics': 'cooking_basics',
  'platos y cubiertos': 'dishes', 'dishes and silverware': 'dishes',
  'mesa de comedor': 'dining_table', 'dining table': 'dining_table',
  'televisión': 'tv', 'tv': 'tv', 'television': 'tv',
  'libros': 'books', 'books': 'books',
  'juegos de mesa': 'board_games', 'board games': 'board_games',
  'aire acondicionado': 'ac', 'air conditioning': 'ac',
  'calefacción': 'heating', 'heating': 'heating',
  'ventilador de techo': 'ceiling_fan', 'ceiling fan': 'ceiling_fan',
  'ventiladores portátiles': 'portable_fan', 'portable fans': 'portable_fan',
  'wifi': 'wifi',
  'zona para trabajar': 'workspace', 'workspace': 'workspace', 'dedicated workspace': 'workspace',
  'detector de humo': 'smoke_detector', 'smoke detector': 'smoke_detector',
  'detector de monóxido de carbono': 'co_detector', 'carbon monoxide detector': 'co_detector',
  'botiquín': 'first_aid', 'first aid kit': 'first_aid',
  'extintor': 'fire_extinguisher', 'fire extinguisher': 'fire_extinguisher',
  'caja fuerte': 'safe', 'safe': 'safe',
  'parking gratuito': 'free_parking', 'free parking': 'free_parking',
  'aparcamiento de pago': 'paid_parking', 'paid parking': 'paid_parking',
  'ascensor': 'elevator', 'elevator': 'elevator',
  'cerradura inteligente': 'smart_lock', 'smart lock': 'smart_lock',
  'piscina': 'pool', 'pool': 'pool',
  'jacuzzi': 'jacuzzi', 'hot tub': 'jacuzzi',
  'terraza': 'terrace', 'terrace': 'terrace',
  'jardín': 'garden', 'garden': 'garden',
  'barbacoa': 'bbq', 'bbq': 'bbq',
  'balcón': 'balcony', 'balcony': 'balcony',
  'patio': 'patio',
  'llegada autónoma': 'self_checkin', 'self check-in': 'self_checkin',
  'se admiten mascotas': 'pets_allowed', 'pets allowed': 'pets_allowed',
}

export function mapAirbnbAmenities(airbnbAmenities: string[]): string[] {
  const mapped = new Set<string>()
  for (const amenity of airbnbAmenities) {
    const lower = amenity.toLowerCase().trim()
    // Direct match
    if (AIRBNB_MAPPING[lower]) {
      mapped.add(AIRBNB_MAPPING[lower])
      continue
    }
    // Partial match
    for (const [keyword, id] of Object.entries(AIRBNB_MAPPING)) {
      if (lower.includes(keyword) || keyword.includes(lower)) {
        mapped.add(id)
        break
      }
    }
  }
  return [...mapped]
}
