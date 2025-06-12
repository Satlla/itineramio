export interface ZoneCategory {
  id: string
  title: string
  icon: string
  description: string
  type: 'simple' | 'complex'
  zones: ZoneTemplate[]
}

export interface ZoneTemplate {
  id: string
  name: string
  iconId: string
  description: string
  category: string
  type: 'simple' | 'complex'
  isOfficial: boolean
  elements?: ElementTemplate[]
}

export interface ElementTemplate {
  id: string
  name: string
  iconId: string
  description: string
  steps: StepTemplate[]
}

export interface StepTemplate {
  title: string
  description?: string
  type: 'text' | 'image' | 'video' | 'link'
  content?: string
  mediaUrl?: string
  order: number
}

export const ZONE_CATEGORIES: ZoneCategory[] = [
  {
    id: 'services',
    title: '⚡ Servicios',
    icon: '⚡',
    description: 'Información básica y servicios',
    type: 'simple',
    zones: [
      {
        id: 'wifi',
        name: 'WiFi',
        iconId: 'wifi',
        description: 'Información de conexión WiFi',
        category: 'services',
        type: 'simple',
        isOfficial: true
      },
      {
        id: 'checkin',
        name: 'Check-in',
        iconId: 'door',
        description: 'Proceso de entrada',
        category: 'services',
        type: 'simple',
        isOfficial: true
      },
      {
        id: 'checkout',
        name: 'Check-out',
        iconId: 'exit',
        description: 'Proceso de salida',
        category: 'services',
        type: 'simple',
        isOfficial: true
      },
      {
        id: 'parking',
        name: 'Parking',
        iconId: 'car',
        description: 'Información de aparcamiento',
        category: 'services',
        type: 'simple',
        isOfficial: true
      }
    ]
  },
  {
    id: 'interior',
    title: '🏠 Interior',
    icon: '🏠',
    description: 'Espacios interiores con elementos',
    type: 'complex',
    zones: [
      {
        id: 'kitchen',
        name: 'Cocina',
        iconId: 'kitchen-main',
        description: 'Electrodomésticos y utensilios',
        category: 'interior',
        type: 'complex',
        isOfficial: true,
        elements: [
          {
            id: 'vitroceramica',
            name: 'Vitrocerámica',
            iconId: 'stove',
            description: 'Cocina de inducción',
            steps: [
              {
                title: 'Pulsa el botón de encendido',
                description: 'Localiza el botón principal en la esquina derecha',
                type: 'text',
                content: 'El botón de encendido está ubicado en la parte frontal derecha de la vitrocerámica.',
                order: 1
              },
              {
                title: 'Desbloquea la superficie',
                description: 'Toca el símbolo de candado durante 3 segundos',
                type: 'image',
                mediaUrl: '/images/vitroceramica-unlock.jpg',
                order: 2
              },
              {
                title: 'Selecciona la temperatura',
                description: 'Usa los controles + y - para ajustar',
                type: 'text',
                content: 'Niveles recomendados: 1-3 para calentar, 4-6 para cocinar, 7-9 para hervir.',
                order: 3
              }
            ]
          },
          {
            id: 'microondas',
            name: 'Microondas',
            iconId: 'microwave',
            description: 'Microondas integrado',
            steps: [
              {
                title: 'Abre la puerta',
                description: 'Presiona el botón de apertura',
                type: 'text',
                content: 'El botón está ubicado en la parte inferior derecha de la puerta.',
                order: 1
              },
              {
                title: 'Configura el tiempo',
                description: 'Usa el dial giratorio para establecer minutos',
                type: 'image',
                mediaUrl: '/images/microondas-dial.jpg',
                order: 2
              },
              {
                title: 'Inicia el calentamiento',
                description: 'Presiona START o cierra la puerta',
                type: 'text',
                content: 'El microondas comenzará automáticamente al cerrar la puerta si hay tiempo configurado.',
                order: 3
              }
            ]
          },
          {
            id: 'lavavajillas',
            name: 'Lavavajillas',
            iconId: 'dishwasher',
            description: 'Lavavajillas integrado',
            steps: [
              {
                title: 'Carga los platos',
                description: 'Coloca los platos en las bandejas',
                type: 'text',
                content: 'Platos y vasos en la bandeja superior, ollas y sartenes en la inferior.',
                order: 1
              },
              {
                title: 'Añade detergente',
                description: 'Usa las pastillas del cajón superior',
                type: 'image',
                mediaUrl: '/images/lavavajillas-detergente.jpg',
                order: 2
              },
              {
                title: 'Selecciona programa',
                description: 'Programa ECO para uso normal',
                type: 'text',
                content: 'Programa ECO (2h): uso diario. Programa Rápido (30min): poco sucio.',
                order: 3
              }
            ]
          }
        ]
      },
      {
        id: 'bathroom',
        name: 'Baño',
        iconId: 'bath',
        description: 'Elementos del baño',
        category: 'interior',
        type: 'complex',
        isOfficial: true,
        elements: [
          {
            id: 'shower',
            name: 'Ducha',
            iconId: 'shower',
            description: 'Sistema de ducha',
            steps: [
              {
                title: 'Abre el grifo',
                description: 'Gira la maneta hacia la izquierda',
                type: 'text',
                content: 'Izquierda para agua caliente, derecha para fría.',
                order: 1
              },
              {
                title: 'Ajusta la temperatura',
                description: 'Espera 30 segundos para estabilizar',
                type: 'image',
                mediaUrl: '/images/shower-temperature.jpg',
                order: 2
              },
              {
                title: 'Activa la ducha',
                description: 'Levanta la palanca del desviador',
                type: 'text',
                content: 'La palanca está en la parte superior del grifo.',
                order: 3
              }
            ]
          }
        ]
      },
      {
        id: 'bedroom',
        name: 'Dormitorio',
        iconId: 'bed',
        description: 'Elementos del dormitorio',
        category: 'interior',
        type: 'complex',
        isOfficial: true,
        elements: [
          {
            id: 'ac',
            name: 'Aire Acondicionado',
            iconId: 'wind',
            description: 'Control de climatización',
            steps: [
              {
                title: 'Enciende el aire',
                description: 'Usa el mando a distancia',
                type: 'text',
                content: 'El mando está en la mesilla de noche.',
                order: 1
              },
              {
                title: 'Selecciona temperatura',
                description: 'Temperatura recomendada: 22-24°C',
                type: 'image',
                mediaUrl: '/images/ac-remote.jpg',
                order: 2
              },
              {
                title: 'Ajusta la velocidad',
                description: 'Modo AUTO para mejor eficiencia',
                type: 'text',
                content: 'AUTO ajusta automáticamente la velocidad según la temperatura.',
                order: 3
              }
            ]
          }
        ]
      },
      {
        id: 'living-room',
        name: 'Salón',
        iconId: 'sofa',
        description: 'Zona de estar y entretenimiento',
        category: 'interior',
        type: 'complex',
        isOfficial: true,
        elements: [
          {
            id: 'tv',
            name: 'TV Smart',
            iconId: 'tv',
            description: 'Televisión inteligente',
            steps: [
              {
                title: 'Enciende la TV',
                description: 'Usa el mando o botón lateral',
                type: 'text',
                content: 'El botón de encendido está en la parte inferior derecha de la TV.',
                order: 1
              },
              {
                title: 'Conecta a WiFi',
                description: 'Ve a Configuración > Red',
                type: 'image',
                mediaUrl: '/images/tv-wifi.jpg',
                order: 2
              },
              {
                title: 'Inicia sesión en apps',
                description: 'Netflix, Prime Video, etc.',
                type: 'text',
                content: 'Puedes usar tus propias cuentas o las disponibles (consulta la información de WiFi).',
                order: 3
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'exterior',
    title: '🌿 Exterior',
    icon: '🌿',
    description: 'Espacios exteriores y jardín',
    type: 'complex',
    zones: [
      {
        id: 'pool',
        name: 'Piscina',
        iconId: 'pool',
        description: 'Área de piscina y relajación',
        category: 'exterior',
        type: 'complex',
        isOfficial: true,
        elements: [
          {
            id: 'pool-system',
            name: 'Sistema de Piscina',
            iconId: 'pool',
            description: 'Control de filtrado y limpieza',
            steps: [
              {
                title: 'Verifica el nivel de cloro',
                description: 'Usa las tiras reactivas',
                type: 'text',
                content: 'Nivel óptimo: 1.0-3.0 ppm. Tiras en el armario de piscina.',
                order: 1
              },
              {
                title: 'Activa la depuradora',
                description: 'Panel de control en caseta técnica',
                type: 'image',
                mediaUrl: '/images/pool-control.jpg',
                order: 2
              },
              {
                title: 'Programa filtrado',
                description: '8 horas diarias recomendadas',
                type: 'text',
                content: 'Filtrado automático de 8:00-12:00 y 20:00-24:00.',
                order: 3
              }
            ]
          }
        ]
      },
      {
        id: 'garden',
        name: 'Jardín',
        iconId: 'tree',
        description: 'Cuidado del jardín',
        category: 'exterior',
        type: 'complex',
        isOfficial: true,
        elements: [
          {
            id: 'irrigation',
            name: 'Riego',
            iconId: 'water',
            description: 'Sistema de riego automático',
            steps: [
              {
                title: 'Verifica el programador',
                description: 'Panel junto a la puerta principal',
                type: 'text',
                content: 'Riego automático: 6:00 y 21:00 durante 15 minutos.',
                order: 1
              },
              {
                title: 'Riego manual',
                description: 'Usa la manguera del garaje',
                type: 'image',
                mediaUrl: '/images/garden-hose.jpg',
                order: 2
              },
              {
                title: 'Cuidado de plantas',
                description: 'Las plantas necesitan agua extra en verano',
                type: 'text',
                content: 'En julio y agosto, riego adicional por las mañanas.',
                order: 3
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'restaurant',
    title: '🍽️ Restaurante',
    icon: '🍽️',
    description: 'Gestión de restaurante y cocina profesional',
    type: 'complex',
    zones: [
      {
        id: 'professional-kitchen',
        name: 'Cocina Profesional',
        iconId: 'chef',
        description: 'Equipamiento de cocina comercial',
        category: 'restaurant',
        type: 'complex',
        isOfficial: true,
        elements: [
          {
            id: 'industrial-fryer',
            name: 'Freidora Industrial',
            iconId: 'fryer',
            description: 'Freidora de doble cestillo',
            steps: [
              {
                title: 'Precalienta el aceite',
                description: 'Temperatura óptima: 180°C',
                type: 'text',
                content: 'Tiempo de precalentamiento: 15-20 minutos.',
                order: 1
              },
              {
                title: 'Controla la temperatura',
                description: 'Usa el termostato digital',
                type: 'image',
                mediaUrl: '/images/fryer-control.jpg',
                order: 2
              },
              {
                title: 'Limpia después del uso',
                description: 'Filtra el aceite diariamente',
                type: 'text',
                content: 'Filtrado al final del servicio, cambio de aceite semanal.',
                order: 3
              }
            ]
          }
        ]
      },
      {
        id: 'bar',
        name: 'Barra',
        iconId: 'cocktail',
        description: 'Gestión de bebidas y cócteles',
        category: 'restaurant',
        type: 'complex',
        isOfficial: true,
        elements: [
          {
            id: 'coffee-machine',
            name: 'Máquina de Café',
            iconId: 'coffee',
            description: 'Cafetera profesional',
            steps: [
              {
                title: 'Enciende la máquina',
                description: 'Tiempo de calentamiento: 5 minutos',
                type: 'text',
                content: 'Luz verde indica que está lista para usar.',
                order: 1
              },
              {
                title: 'Ajusta la molienda',
                description: 'Molido fino para espresso',
                type: 'image',
                mediaUrl: '/images/coffee-grind.jpg',
                order: 2
              },
              {
                title: 'Presiona el café',
                description: 'Presión uniforme y firme',
                type: 'text',
                content: 'Presión de 15kg aproximadamente, superficie nivelada.',
                order: 3
              }
            ]
          }
        ]
      }
    ]
  }
]

export function getZonesByCategory(categoryId: string): ZoneTemplate[] {
  const category = ZONE_CATEGORIES.find(cat => cat.id === categoryId)
  return category?.zones || []
}

export function getZoneById(zoneId: string): ZoneTemplate | undefined {
  for (const category of ZONE_CATEGORIES) {
    const zone = category.zones.find(zone => zone.id === zoneId)
    if (zone) return zone
  }
  return undefined
}

export function isSimpleZone(zoneId: string): boolean {
  const zone = getZoneById(zoneId)
  return zone?.type === 'simple'
}

export function isComplexZone(zoneId: string): boolean {
  const zone = getZoneById(zoneId)
  return zone?.type === 'complex'
}