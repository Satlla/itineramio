export interface MultilingualText {
  es: string
  en?: string
  fr?: string
}

export interface ApartmentElement {
  id: string
  name: MultilingualText
  description: MultilingualText
  icon: string
  category: 'kitchen' | 'bathroom' | 'bedroom' | 'living' | 'tech' | 'services' | 'access' | 'exterior'
  priority: number // 1-10, higher means more essential
}

// Helper function to get text from multilingual object
export function getElementText(value: MultilingualText | string | undefined, language: string = 'es', fallback: string = ''): string {
  if (!value) return fallback
  if (typeof value === 'string') return value
  return value[language as keyof MultilingualText] || value.es || fallback
}

export const apartmentElements: ApartmentElement[] = [
  // COCINA - Kitchen elements
  {
    id: 'vitroceramica',
    name: { es: 'Vitrocerámica', en: 'Cooktop', fr: 'Plaque de cuisson' },
    description: { es: 'Instrucciones para usar la vitrocerámica/placa de inducción', en: 'Instructions for using the cooktop/induction hob', fr: 'Instructions pour utiliser la plaque de cuisson/induction' },
    icon: 'cooking',
    category: 'kitchen',
    priority: 9
  },
  {
    id: 'horno',
    name: { es: 'Horno', en: 'Oven', fr: 'Four' },
    description: { es: 'Cómo usar el horno, temperaturas y programas', en: 'How to use the oven, temperatures and programs', fr: 'Comment utiliser le four, températures et programmes' },
    icon: 'microwave',
    category: 'kitchen',
    priority: 8
  },
  {
    id: 'microondas',
    name: { es: 'Microondas', en: 'Microwave', fr: 'Micro-ondes' },
    description: { es: 'Instrucciones del microondas y potencias', en: 'Microwave instructions and power levels', fr: 'Instructions du micro-ondes et puissances' },
    icon: 'microwave',
    category: 'kitchen',
    priority: 7
  },
  {
    id: 'lavavajillas',
    name: { es: 'Lavavajillas', en: 'Dishwasher', fr: 'Lave-vaisselle' },
    description: { es: 'Cómo usar el lavavajillas, pastillas y programas', en: 'How to use the dishwasher, tablets and programs', fr: 'Comment utiliser le lave-vaisselle, tablettes et programmes' },
    icon: 'kitchen',
    category: 'kitchen',
    priority: 8
  },
  {
    id: 'frigorifico',
    name: { es: 'Frigorífico', en: 'Refrigerator', fr: 'Réfrigérateur' },
    description: { es: 'Uso del frigorífico, congelador y ajustes', en: 'Using the refrigerator, freezer and settings', fr: 'Utilisation du réfrigérateur, congélateur et réglages' },
    icon: 'refrigerator',
    category: 'kitchen',
    priority: 9
  },
  {
    id: 'cafetera',
    name: { es: 'Cafetera', en: 'Coffee machine', fr: 'Machine à café' },
    description: { es: 'Instrucciones para hacer café, cápsulas disponibles', en: 'Coffee making instructions, available pods', fr: 'Instructions pour faire du café, capsules disponibles' },
    icon: 'coffee',
    category: 'kitchen',
    priority: 6
  },
  {
    id: 'tostadora',
    name: { es: 'Tostadora', en: 'Toaster', fr: 'Grille-pain' },
    description: { es: 'Cómo usar la tostadora y niveles de tostado', en: 'How to use the toaster and browning levels', fr: 'Comment utiliser le grille-pain et niveaux de brunissage' },
    icon: 'kitchen',
    category: 'kitchen',
    priority: 4
  },
  {
    id: 'batidora',
    name: { es: 'Batidora/Thermomix', en: 'Blender/Food processor', fr: 'Mixeur/Robot culinaire' },
    description: { es: 'Instrucciones para batidora o robot de cocina', en: 'Instructions for blender or food processor', fr: 'Instructions pour mixeur ou robot culinaire' },
    icon: 'kitchen',
    category: 'kitchen',
    priority: 3
  },

  // TECNOLOGÍA - Tech elements
  {
    id: 'smart-tv',
    name: { es: 'Smart TV', en: 'Smart TV', fr: 'Smart TV' },
    description: { es: 'Cómo usar la Smart TV, apps disponibles, mandos', en: 'How to use the Smart TV, available apps, remotes', fr: 'Comment utiliser la Smart TV, applications disponibles, télécommandes' },
    icon: 'tv',
    category: 'tech',
    priority: 9
  },
  {
    id: 'wifi',
    name: { es: 'WiFi', en: 'WiFi', fr: 'WiFi' },
    description: { es: 'Contraseña del WiFi y instrucciones de conexión', en: 'WiFi password and connection instructions', fr: 'Mot de passe WiFi et instructions de connexion' },
    icon: 'wifi',
    category: 'tech',
    priority: 10
  },
  {
    id: 'netflix',
    name: { es: 'Netflix/Streaming', en: 'Netflix/Streaming', fr: 'Netflix/Streaming' },
    description: { es: 'Acceso a Netflix, Prime Video y otras plataformas', en: 'Access to Netflix, Prime Video and other platforms', fr: 'Accès à Netflix, Prime Video et autres plateformes' },
    icon: 'tv',
    category: 'tech',
    priority: 7
  },
  {
    id: 'sonos',
    name: { es: 'Sistema de sonido', en: 'Sound system', fr: 'Système audio' },
    description: { es: 'Altavoces Sonos, Bluetooth o sistema de música', en: 'Sonos speakers, Bluetooth or music system', fr: 'Enceintes Sonos, Bluetooth ou système audio' },
    icon: 'entertainment',
    category: 'tech',
    priority: 5
  },
  {
    id: 'ps5',
    name: { es: 'PlayStation/Xbox', en: 'PlayStation/Xbox', fr: 'PlayStation/Xbox' },
    description: { es: 'Consola de videojuegos disponible', en: 'Video game console available', fr: 'Console de jeux vidéo disponible' },
    icon: 'entertainment',
    category: 'tech',
    priority: 3
  },

  // AIRE ACONDICIONADO Y CLIMA - Climate elements
  {
    id: 'aire-acondicionado',
    name: { es: 'Aire Acondicionado', en: 'Air Conditioning', fr: 'Climatisation' },
    description: { es: 'Mandos del aire acondicionado, temperaturas recomendadas', en: 'A/C remotes, recommended temperatures', fr: 'Télécommandes de climatisation, températures recommandées' },
    icon: 'ac',
    category: 'services',
    priority: 9
  },
  {
    id: 'calefaccion',
    name: { es: 'Calefacción', en: 'Heating', fr: 'Chauffage' },
    description: { es: 'Sistema de calefacción, termostatos y radiadores', en: 'Heating system, thermostats and radiators', fr: 'Système de chauffage, thermostats et radiateurs' },
    icon: 'heating',
    category: 'services',
    priority: 8
  },
  {
    id: 'ventiladores',
    name: { es: 'Ventiladores', en: 'Fans', fr: 'Ventilateurs' },
    description: { es: 'Ventiladores de techo o de pie disponibles', en: 'Ceiling or standing fans available', fr: 'Ventilateurs de plafond ou sur pied disponibles' },
    icon: 'heating',
    category: 'services',
    priority: 4
  },

  // DORMITORIO - Bedroom elements
  {
    id: 'cama-king',
    name: { es: 'Cama King Size', en: 'King Size Bed', fr: 'Lit King Size' },
    description: { es: 'Información sobre la cama principal y ropa de cama', en: 'Information about the main bed and linens', fr: 'Informations sur le lit principal et la literie' },
    icon: 'bedroom',
    category: 'bedroom',
    priority: 9
  },
  {
    id: 'cama-individual',
    name: { es: 'Camas individuales', en: 'Single beds', fr: 'Lits simples' },
    description: { es: 'Camas individuales o literas disponibles', en: 'Single beds or bunk beds available', fr: 'Lits simples ou lits superposés disponibles' },
    icon: 'bedroom',
    category: 'bedroom',
    priority: 8
  },
  {
    id: 'armario',
    name: { es: 'Armario', en: 'Wardrobe', fr: 'Armoire' },
    description: { es: 'Perchas, cajones y espacio de almacenamiento', en: 'Hangers, drawers and storage space', fr: 'Cintres, tiroirs et espace de rangement' },
    icon: 'bedroom',
    category: 'bedroom',
    priority: 7
  },
  {
    id: 'caja-fuerte',
    name: { es: 'Caja fuerte', en: 'Safe', fr: 'Coffre-fort' },
    description: { es: 'Cómo usar la caja fuerte de la habitación', en: 'How to use the room safe', fr: 'Comment utiliser le coffre-fort de la chambre' },
    icon: 'security',
    category: 'bedroom',
    priority: 6
  },

  // BAÑO - Bathroom elements
  {
    id: 'ducha-lluvia',
    name: { es: 'Ducha de lluvia', en: 'Rain shower', fr: 'Douche pluie' },
    description: { es: 'Instrucciones para la ducha de lluvia o hidromasaje', en: 'Instructions for rain shower or hydromassage', fr: 'Instructions pour la douche pluie ou hydromassage' },
    icon: 'shower',
    category: 'bathroom',
    priority: 8
  },
  {
    id: 'jacuzzi',
    name: { es: 'Jacuzzi/Bañera', en: 'Jacuzzi/Bathtub', fr: 'Jacuzzi/Baignoire' },
    description: { es: 'Cómo usar el jacuzzi o bañera de hidromasaje', en: 'How to use the jacuzzi or whirlpool bath', fr: 'Comment utiliser le jacuzzi ou la baignoire à remous' },
    icon: 'bathroom',
    category: 'bathroom',
    priority: 6
  },
  {
    id: 'secador',
    name: { es: 'Secador de pelo', en: 'Hair dryer', fr: 'Sèche-cheveux' },
    description: { es: 'Ubicación y uso del secador de pelo', en: 'Location and use of hair dryer', fr: 'Emplacement et utilisation du sèche-cheveux' },
    icon: 'bathroom',
    category: 'bathroom',
    priority: 5
  },
  {
    id: 'amenities',
    name: { es: 'Amenities', en: 'Amenities', fr: 'Produits d\'accueil' },
    description: { es: 'Champú, gel, toallas y productos disponibles', en: 'Shampoo, gel, towels and available products', fr: 'Shampoing, gel, serviettes et produits disponibles' },
    icon: 'bathroom',
    category: 'bathroom',
    priority: 7
  },

  // SERVICIOS - Services elements
  {
    id: 'lavadora',
    name: { es: 'Lavadora', en: 'Washing machine', fr: 'Machine à laver' },
    description: { es: 'Cómo usar la lavadora, detergente y programas', en: 'How to use washing machine, detergent and programs', fr: 'Comment utiliser la machine à laver, lessive et programmes' },
    icon: 'laundry',
    category: 'services',
    priority: 8
  },
  {
    id: 'secadora',
    name: { es: 'Secadora', en: 'Dryer', fr: 'Sèche-linge' },
    description: { es: 'Instrucciones para la secadora', en: 'Dryer instructions', fr: 'Instructions pour le sèche-linge' },
    icon: 'laundry',
    category: 'services',
    priority: 6
  },
  {
    id: 'plancha',
    name: { es: 'Plancha', en: 'Iron', fr: 'Fer à repasser' },
    description: { es: 'Plancha y tabla de planchar disponibles', en: 'Iron and ironing board available', fr: 'Fer à repasser et planche à repasser disponibles' },
    icon: 'laundry',
    category: 'services',
    priority: 4
  },
  {
    id: 'aspiradora',
    name: { es: 'Aspiradora', en: 'Vacuum cleaner', fr: 'Aspirateur' },
    description: { es: 'Aspiradora Dyson o robot aspirador disponible', en: 'Dyson vacuum or robot vacuum available', fr: 'Aspirateur Dyson ou robot aspirateur disponible' },
    icon: 'laundry',
    category: 'services',
    priority: 3
  },

  // ACCESO - Access elements
  {
    id: 'cerradura-digital',
    name: { es: 'Cerradura digital', en: 'Digital lock', fr: 'Serrure numérique' },
    description: { es: 'Código de la cerradura digital o tarjeta de acceso', en: 'Digital lock code or access card', fr: 'Code de la serrure numérique ou carte d\'accès' },
    icon: 'security',
    category: 'access',
    priority: 10
  },
  {
    id: 'llaves-fisicas',
    name: { es: 'Llaves físicas', en: 'Physical keys', fr: 'Clés physiques' },
    description: { es: 'Ubicación y uso de las llaves tradicionales', en: 'Location and use of traditional keys', fr: 'Emplacement et utilisation des clés traditionnelles' },
    icon: 'keys',
    category: 'access',
    priority: 9
  },
  {
    id: 'portero-automatico',
    name: { es: 'Portero automático', en: 'Intercom', fr: 'Interphone' },
    description: { es: 'Cómo funciona el portero automático del edificio', en: 'How the building intercom works', fr: 'Comment fonctionne l\'interphone de l\'immeuble' },
    icon: 'entrance',
    category: 'access',
    priority: 8
  },
  {
    id: 'ascensor',
    name: { es: 'Ascensor', en: 'Elevator', fr: 'Ascenseur' },
    description: { es: 'Instrucciones del ascensor y planta del apartamento', en: 'Elevator instructions and apartment floor', fr: 'Instructions de l\'ascenseur et étage de l\'appartement' },
    icon: 'entrance',
    category: 'access',
    priority: 7
  },

  // EXTERIOR - Exterior elements
  {
    id: 'terraza',
    name: { es: 'Terraza/Balcón', en: 'Terrace/Balcony', fr: 'Terrasse/Balcon' },
    description: { es: 'Mobiliario de exterior y normas de uso', en: 'Outdoor furniture and usage rules', fr: 'Mobilier extérieur et règles d\'utilisation' },
    icon: 'flower',
    category: 'exterior',
    priority: 7
  },
  {
    id: 'barbacoa',
    name: { es: 'Barbacoa', en: 'BBQ', fr: 'Barbecue' },
    description: { es: 'Cómo usar la barbacoa de la terraza', en: 'How to use the terrace BBQ', fr: 'Comment utiliser le barbecue de la terrasse' },
    icon: 'mountain',
    category: 'exterior',
    priority: 5
  },
  {
    id: 'piscina-privada',
    name: { es: 'Piscina privada', en: 'Private pool', fr: 'Piscine privée' },
    description: { es: 'Normas de uso de la piscina privada', en: 'Private pool usage rules', fr: 'Règles d\'utilisation de la piscine privée' },
    icon: 'waves',
    category: 'exterior',
    priority: 6
  },
  {
    id: 'jardin',
    name: { es: 'Jardín', en: 'Garden', fr: 'Jardin' },
    description: { es: 'Cuidado del jardín y plantas', en: 'Garden and plant care', fr: 'Entretien du jardin et des plantes' },
    icon: 'trees',
    category: 'exterior',
    priority: 4
  },

  // SALON - Living room elements
  {
    id: 'sofa-cama',
    name: { es: 'Sofá cama', en: 'Sofa bed', fr: 'Canapé-lit' },
    description: { es: 'Cómo convertir el sofá en cama adicional', en: 'How to convert the sofa into an extra bed', fr: 'Comment convertir le canapé en lit supplémentaire' },
    icon: 'living',
    category: 'living',
    priority: 7
  },
  {
    id: 'mesa-comedor',
    name: { es: 'Mesa de comedor', en: 'Dining table', fr: 'Table à manger' },
    description: { es: 'Mesa extensible y sillas adicionales', en: 'Extendable table and extra chairs', fr: 'Table extensible et chaises supplémentaires' },
    icon: 'living',
    category: 'living',
    priority: 6
  },
  {
    id: 'chimenea',
    name: { es: 'Chimenea', en: 'Fireplace', fr: 'Cheminée' },
    description: { es: 'Cómo usar la chimenea (si disponible)', en: 'How to use the fireplace (if available)', fr: 'Comment utiliser la cheminée (si disponible)' },
    icon: 'heating',
    category: 'living',
    priority: 4
  },

  // PARKING Y TRANSPORTE - Parking and transport elements
  {
    id: 'plaza-garaje',
    name: { es: 'Plaza de garaje', en: 'Garage space', fr: 'Place de parking' },
    description: { es: 'Ubicación y acceso a la plaza de garaje', en: 'Location and access to garage space', fr: 'Emplacement et accès à la place de parking' },
    icon: 'parking',
    category: 'access',
    priority: 8
  },
  {
    id: 'parking-publico',
    name: { es: 'Parking público', en: 'Public parking', fr: 'Parking public' },
    description: { es: 'Opciones de aparcamiento en la zona', en: 'Parking options in the area', fr: 'Options de stationnement dans le quartier' },
    icon: 'parking',
    category: 'access',
    priority: 6
  },
  {
    id: 'transporte-publico',
    name: { es: 'Transporte público', en: 'Public transport', fr: 'Transports en commun' },
    description: { es: 'Metro, bus y estaciones cercanas', en: 'Metro, bus and nearby stations', fr: 'Métro, bus et stations à proximité' },
    icon: 'transport',
    category: 'access',
    priority: 7
  },

  // INFORMACIÓN GENERAL - General information elements
  {
    id: 'check-in-instrucciones',
    name: { es: 'Check-in', en: 'Check-in', fr: 'Arrivée' },
    description: { es: 'Proceso completo de entrada al apartamento', en: 'Complete apartment entry process', fr: 'Processus complet d\'entrée dans l\'appartement' },
    icon: 'entrance',
    category: 'access',
    priority: 10
  },
  {
    id: 'check-out-instrucciones',
    name: { es: 'Check-out', en: 'Check-out', fr: 'Départ' },
    description: { es: 'Instrucciones para dejar el apartamento', en: 'Instructions for leaving the apartment', fr: 'Instructions pour quitter l\'appartement' },
    icon: 'entrance',
    category: 'access',
    priority: 10
  },
  {
    id: 'normas-edificio',
    name: { es: 'Normas del edificio', en: 'Building rules', fr: 'Règlement de l\'immeuble' },
    description: { es: 'Horarios de silencio y normas de convivencia', en: 'Quiet hours and community rules', fr: 'Heures de silence et règles de cohabitation' },
    icon: 'rules',
    category: 'services',
    priority: 8
  },
  {
    id: 'contacto-emergencia',
    name: { es: 'Contacto de emergencia', en: 'Emergency contact', fr: 'Contact d\'urgence' },
    description: { es: 'Teléfonos de emergencia y contacto del anfitrión', en: 'Emergency phones and host contact', fr: 'Téléphones d\'urgence et contact de l\'hôte' },
    icon: 'emergency',
    category: 'services',
    priority: 9
  },
  {
    id: 'basura-reciclaje',
    name: { es: 'Basura y reciclaje', en: 'Trash & recycling', fr: 'Déchets et recyclage' },
    description: { es: 'Dónde tirar la basura y horarios de recogida', en: 'Where to throw trash and collection times', fr: 'Où jeter les déchets et horaires de collecte' },
    icon: 'trash',
    category: 'services',
    priority: 7
  }
]

export const categoryLabels = {
  kitchen: { es: 'Cocina', en: 'Kitchen', fr: 'Cuisine' },
  bathroom: { es: 'Baño', en: 'Bathroom', fr: 'Salle de bain' },
  bedroom: { es: 'Dormitorio', en: 'Bedroom', fr: 'Chambre' },
  living: { es: 'Salón', en: 'Living room', fr: 'Salon' },
  tech: { es: 'Tecnología', en: 'Technology', fr: 'Technologie' },
  services: { es: 'Servicios', en: 'Services', fr: 'Services' },
  access: { es: 'Acceso', en: 'Access', fr: 'Accès' },
  exterior: { es: 'Exterior', en: 'Outdoor', fr: 'Extérieur' }
}

// Helper to get category label for a specific language
export function getCategoryLabel(category: string, language: string = 'es'): string {
  const labels = categoryLabels[category as keyof typeof categoryLabels]
  if (!labels) return category
  return labels[language as keyof typeof labels] || labels.es
}
