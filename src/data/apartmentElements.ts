export interface ApartmentElement {
  id: string
  name: string
  description: string
  icon: string
  category: 'kitchen' | 'bathroom' | 'bedroom' | 'living' | 'tech' | 'services' | 'access' | 'exterior'
  priority: number // 1-10, higher means more essential
}

export const apartmentElements: ApartmentElement[] = [
  // COCINA - Elementos específicos
  {
    id: 'vitroceramica',
    name: 'Vitrocerámica',
    description: 'Instrucciones para usar la vitrocerámica/placa de inducción',
    icon: 'cooking',
    category: 'kitchen',
    priority: 9
  },
  {
    id: 'horno',
    name: 'Horno',
    description: 'Cómo usar el horno, temperaturas y programas',
    icon: 'microwave',
    category: 'kitchen',
    priority: 8
  },
  {
    id: 'microondas',
    name: 'Microondas',
    description: 'Instrucciones del microondas y potencias',
    icon: 'microwave',
    category: 'kitchen',
    priority: 7
  },
  {
    id: 'lavavajillas',
    name: 'Lavavajillas',
    description: 'Cómo usar el lavavajillas, pastillas y programas',
    icon: 'kitchen',
    category: 'kitchen',
    priority: 8
  },
  {
    id: 'frigorifico',
    name: 'Frigorífico',
    description: 'Uso del frigorífico, congelador y ajustes',
    icon: 'refrigerator',
    category: 'kitchen',
    priority: 9
  },
  {
    id: 'cafetera',
    name: 'Cafetera',
    description: 'Instrucciones para hacer café, cápsulas disponibles',
    icon: 'coffee',
    category: 'kitchen',
    priority: 6
  },
  {
    id: 'tostadora',
    name: 'Tostadora',
    description: 'Cómo usar la tostadora y niveles de tostado',
    icon: 'kitchen',
    category: 'kitchen',
    priority: 4
  },
  {
    id: 'batidora',
    name: 'Batidora/Thermomix',
    description: 'Instrucciones para batidora o robot de cocina',
    icon: 'kitchen',
    category: 'kitchen',
    priority: 3
  },

  // TECNOLOGÍA
  {
    id: 'smart-tv',
    name: 'Smart TV',
    description: 'Cómo usar la Smart TV, apps disponibles, mandos',
    icon: 'tv',
    category: 'tech',
    priority: 9
  },
  {
    id: 'wifi',
    name: 'WiFi',
    description: 'Contraseña del WiFi y instrucciones de conexión',
    icon: 'wifi',
    category: 'tech',
    priority: 10
  },
  {
    id: 'netflix',
    name: 'Netflix/Streaming',
    description: 'Acceso a Netflix, Prime Video y otras plataformas',
    icon: 'tv',
    category: 'tech',
    priority: 7
  },
  {
    id: 'sonos',
    name: 'Sistema de sonido',
    description: 'Altavoces Sonos, Bluetooth o sistema de música',
    icon: 'entertainment',
    category: 'tech',
    priority: 5
  },
  {
    id: 'ps5',
    name: 'PlayStation/Xbox',
    description: 'Consola de videojuegos disponible',
    icon: 'entertainment',
    category: 'tech',
    priority: 3
  },

  // AIRE ACONDICIONADO Y CLIMA
  {
    id: 'aire-acondicionado',
    name: 'Aire Acondicionado',
    description: 'Mandos del aire acondicionado, temperaturas recomendadas',
    icon: 'ac',
    category: 'services',
    priority: 9
  },
  {
    id: 'calefaccion',
    name: 'Calefacción',
    description: 'Sistema de calefacción, termostatos y radiadores',
    icon: 'heating',
    category: 'services',
    priority: 8
  },
  {
    id: 'ventiladores',
    name: 'Ventiladores',
    description: 'Ventiladores de techo o de pie disponibles',
    icon: 'heating',
    category: 'services',
    priority: 4
  },

  // DORMITORIO
  {
    id: 'cama-king',
    name: 'Cama King Size',
    description: 'Información sobre la cama principal y ropa de cama',
    icon: 'bedroom',
    category: 'bedroom',
    priority: 9
  },
  {
    id: 'cama-individual',
    name: 'Camas individuales',
    description: 'Camas individuales o literas disponibles',
    icon: 'bedroom',
    category: 'bedroom',
    priority: 8
  },
  {
    id: 'armario',
    name: 'Armario',
    description: 'Perchas, cajones y espacio de almacenamiento',
    icon: 'bedroom',
    category: 'bedroom',
    priority: 7
  },
  {
    id: 'caja-fuerte',
    name: 'Caja fuerte',
    description: 'Cómo usar la caja fuerte de la habitación',
    icon: 'security',
    category: 'bedroom',
    priority: 6
  },

  // BAÑO
  {
    id: 'ducha-lluvia',
    name: 'Ducha de lluvia',
    description: 'Instrucciones para la ducha de lluvia o hidromasaje',
    icon: 'shower',
    category: 'bathroom',
    priority: 8
  },
  {
    id: 'jacuzzi',
    name: 'Jacuzzi/Bañera',
    description: 'Cómo usar el jacuzzi o bañera de hidromasaje',
    icon: 'bathroom',
    category: 'bathroom',
    priority: 6
  },
  {
    id: 'secador',
    name: 'Secador de pelo',
    description: 'Ubicación y uso del secador de pelo',
    icon: 'bathroom',
    category: 'bathroom',
    priority: 5
  },
  {
    id: 'amenities',
    name: 'Amenities',
    description: 'Champú, gel, toallas y productos disponibles',
    icon: 'bathroom',
    category: 'bathroom',
    priority: 7
  },

  // SERVICIOS
  {
    id: 'lavadora',
    name: 'Lavadora',
    description: 'Cómo usar la lavadora, detergente y programas',
    icon: 'laundry',
    category: 'services',
    priority: 8
  },
  {
    id: 'secadora',
    name: 'Secadora',
    description: 'Instrucciones para la secadora',
    icon: 'laundry',
    category: 'services',
    priority: 6
  },
  {
    id: 'plancha',
    name: 'Plancha',
    description: 'Plancha y tabla de planchar disponibles',
    icon: 'laundry',
    category: 'services',
    priority: 4
  },
  {
    id: 'aspiradora',
    name: 'Aspiradora',
    description: 'Aspiradora Dyson o robot aspirador disponible',
    icon: 'laundry',
    category: 'services',
    priority: 3
  },

  // ACCESO
  {
    id: 'cerradura-digital',
    name: 'Cerradura digital',
    description: 'Código de la cerradura digital o tarjeta de acceso',
    icon: 'security',
    category: 'access',
    priority: 10
  },
  {
    id: 'llaves-fisicas',
    name: 'Llaves físicas',
    description: 'Ubicación y uso de las llaves tradicionales',
    icon: 'keys',
    category: 'access',
    priority: 9
  },
  {
    id: 'portero-automatico',
    name: 'Portero automático',
    description: 'Cómo funciona el portero automático del edificio',
    icon: 'entrance',
    category: 'access',
    priority: 8
  },
  {
    id: 'ascensor',
    name: 'Ascensor',
    description: 'Instrucciones del ascensor y planta del apartamento',
    icon: 'entrance',
    category: 'access',
    priority: 7
  },

  // EXTERIOR
  {
    id: 'terraza',
    name: 'Terraza/Balcón',
    description: 'Mobiliario de exterior y normas de uso',
    icon: 'flower',
    category: 'exterior',
    priority: 7
  },
  {
    id: 'barbacoa',
    name: 'Barbacoa',
    description: 'Cómo usar la barbacoa de la terraza',
    icon: 'mountain',
    category: 'exterior',
    priority: 5
  },
  {
    id: 'piscina-privada',
    name: 'Piscina privada',
    description: 'Normas de uso de la piscina privada',
    icon: 'waves',
    category: 'exterior',
    priority: 6
  },
  {
    id: 'jardin',
    name: 'Jardín',
    description: 'Cuidado del jardín y plantas',
    icon: 'trees',
    category: 'exterior',
    priority: 4
  },

  // SALON
  {
    id: 'sofa-cama',
    name: 'Sofá cama',
    description: 'Cómo convertir el sofá en cama adicional',
    icon: 'living',
    category: 'living',
    priority: 7
  },
  {
    id: 'mesa-comedor',
    name: 'Mesa de comedor',
    description: 'Mesa extensible y sillas adicionales',
    icon: 'living',
    category: 'living',
    priority: 6
  },
  {
    id: 'chimenea',
    name: 'Chimenea',
    description: 'Cómo usar la chimenea (si disponible)',
    icon: 'heating',
    category: 'living',
    priority: 4
  },

  // PARKING Y TRANSPORTE
  {
    id: 'plaza-garaje',
    name: 'Plaza de garaje',
    description: 'Ubicación y acceso a la plaza de garaje',
    icon: 'parking',
    category: 'access',
    priority: 8
  },
  {
    id: 'parking-publico',
    name: 'Parking público',
    description: 'Opciones de aparcamiento en la zona',
    icon: 'parking',
    category: 'access',
    priority: 6
  },
  {
    id: 'transporte-publico',
    name: 'Transporte público',
    description: 'Metro, bus y estaciones cercanas',
    icon: 'transport',
    category: 'access',
    priority: 7
  },

  // INFORMACIÓN GENERAL
  {
    id: 'check-in-instrucciones',
    name: 'Check-in',
    description: 'Proceso completo de entrada al apartamento',
    icon: 'entrance',
    category: 'access',
    priority: 10
  },
  {
    id: 'check-out-instrucciones',
    name: 'Check-out',
    description: 'Instrucciones para dejar el apartamento',
    icon: 'entrance',
    category: 'access',
    priority: 10
  },
  {
    id: 'normas-edificio',
    name: 'Normas del edificio',
    description: 'Horarios de silencio y normas de convivencia',
    icon: 'rules',
    category: 'services',
    priority: 8
  },
  {
    id: 'contacto-emergencia',
    name: 'Contacto de emergencia',
    description: 'Teléfonos de emergencia y contacto del anfitrión',
    icon: 'emergency',
    category: 'services',
    priority: 9
  },
  {
    id: 'basura-reciclaje',
    name: 'Basura y reciclaje',
    description: 'Dónde tirar la basura y horarios de recogida',
    icon: 'trash',
    category: 'services',
    priority: 7
  }
]

export const categoryLabels = {
  kitchen: 'Cocina',
  bathroom: 'Baño',
  bedroom: 'Dormitorio',
  living: 'Salón',
  tech: 'Tecnología',
  services: 'Servicios',
  access: 'Acceso',
  exterior: 'Exterior'
}