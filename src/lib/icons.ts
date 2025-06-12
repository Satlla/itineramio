import { IconCategory } from '@/types'

export const iconCategories: Record<string, IconCategory> = {
  access: {
    id: 'access',
    label: 'Acceso',
    icons: [
      'key', 'lock', 'door-open', 'door-closed', 'keyhole', 
      'log-in', 'log-out', 'scan', 'fingerprint', 'shield-check'
    ]
  },
  appliances: {
    id: 'appliances',
    label: 'Electrodomésticos',
    icons: [
      'microwave', 'washing-machine', 'coffee', 'blender', 'toaster',
      'refrigerator', 'oven', 'dishwasher', 'iron', 'vacuum'
    ]
  },
  entertainment: {
    id: 'entertainment',
    label: 'Entretenimiento',
    icons: [
      'tv', 'speaker', 'gamepad-2', 'book', 'music',
      'headphones', 'radio', 'film', 'camera', 'play-circle'
    ]
  },
  comfort: {
    id: 'comfort',
    label: 'Confort',
    icons: [
      'air-vent', 'thermometer', 'bed', 'sofa', 'pillow',
      'lamp', 'fan', 'heater', 'snowflake', 'sun'
    ]
  },
  connectivity: {
    id: 'connectivity',
    label: 'Conectividad',
    icons: [
      'wifi', 'phone', 'router', 'signal', 'bluetooth',
      'smartphone', 'laptop', 'monitor', 'usb', 'ethernet-port'
    ]
  },
  safety: {
    id: 'safety',
    label: 'Seguridad',
    icons: [
      'shield', 'first-aid', 'phone-call', 'alert-triangle', 'fire-extinguisher',
      'siren', 'eye', 'lock-keyhole', 'shield-alert', 'heart-pulse'
    ]
  },
  utilities: {
    id: 'utilities',
    label: 'Servicios',
    icons: [
      'lightbulb', 'power', 'droplets', 'recycle', 'trash-2',
      'plug', 'battery', 'flash', 'water-drop', 'fuel'
    ]
  },
  amenities: {
    id: 'amenities',
    label: 'Amenidades',
    icons: [
      'waves', 'dumbbell', 'car', 'elevator', 'balcony',
      'trees', 'flower', 'swimming-pool', 'tennis-ball', 'bike'
    ]
  },
  kitchen: {
    id: 'kitchen',
    label: 'Cocina',
    icons: [
      'chef-hat', 'utensils', 'cup-soda', 'wine', 'pizza',
      'cooking-pot', 'microwave', 'refrigerator', 'coffee', 'flame'
    ]
  },
  bathroom: {
    id: 'bathroom',
    label: 'Baño',
    icons: [
      'bath', 'shower-head', 'toilet', 'toothbrush', 'hair-dryer',
      'towel', 'soap', 'mirror', 'scale', 'first-aid'
    ]
  },
  outdoor: {
    id: 'outdoor',
    label: 'Exterior',
    icons: [
      'sun', 'tree-palm', 'flower-2', 'bench', 'tent',
      'mountain', 'waves', 'umbrella', 'grill', 'picnic-table'
    ]
  },
  transport: {
    id: 'transport',
    label: 'Transporte',
    icons: [
      'car', 'bus', 'train', 'plane', 'bike',
      'taxi', 'subway', 'ship', 'truck', 'motorcycle'
    ]
  },
  services: {
    id: 'services',
    label: 'Servicios',
    icons: [
      'shopping-cart', 'store', 'hospital', 'pharmacy', 'bank',
      'gas-station', 'restaurant', 'hotel', 'school', 'church'
    ]
  },
  emergency: {
    id: 'emergency',
    label: 'Emergencias',
    icons: [
      'phone-call', 'siren', 'hospital', 'fire', 'shield-alert',
      'alert-triangle', 'help-circle', 'cross', 'ambulance', 'police-car'
    ]
  }
}

// Iconos más populares para mostrar primero
export const popularIcons = [
  'key', 'wifi', 'tv', 'coffee', 'bed', 'bath', 'car', 'phone',
  'microwave', 'washing-machine', 'air-vent', 'lightbulb'
]

// Iconos recientes del usuario (se almacenaría en localStorage)
export const getRecentIcons = (): string[] => {
  if (typeof window === 'undefined') return []
  
  const recent = localStorage.getItem('recentIcons')
  return recent ? JSON.parse(recent) : []
}

export const addToRecentIcons = (icon: string): void => {
  if (typeof window === 'undefined') return
  
  const recent = getRecentIcons()
  const filtered = recent.filter(i => i !== icon)
  const newRecent = [icon, ...filtered].slice(0, 12) // Máximo 12 iconos recientes
  
  localStorage.setItem('recentIcons', JSON.stringify(newRecent))
}

// Iconos favoritos del usuario
export const getFavoriteIcons = (): string[] => {
  if (typeof window === 'undefined') return []
  
  const favorites = localStorage.getItem('favoriteIcons')
  return favorites ? JSON.parse(favorites) : []
}

export const toggleFavoriteIcon = (icon: string): void => {
  if (typeof window === 'undefined') return
  
  const favorites = getFavoriteIcons()
  const newFavorites = favorites.includes(icon)
    ? favorites.filter(i => i !== icon)
    : [...favorites, icon].slice(0, 20) // Máximo 20 favoritos
  
  localStorage.setItem('favoriteIcons', JSON.stringify(newFavorites))
}

// Buscar iconos por nombre o categoría
export const searchIcons = (query: string): string[] => {
  if (!query.trim()) return []
  
  const queryLower = query.toLowerCase()
  const results: string[] = []
  
  Object.values(iconCategories).forEach(category => {
    // Buscar en nombre de categoría
    if (category.label.toLowerCase().includes(queryLower)) {
      results.push(...category.icons)
    }
    
    // Buscar en nombres de iconos
    category.icons.forEach(icon => {
      if (icon.toLowerCase().includes(queryLower)) {
        results.push(icon)
      }
    })
  })
  
  // Eliminar duplicados y limitar resultados
  return Array.from(new Set(results)).slice(0, 50)
}

// Obtener categoría de un icono
export const getIconCategory = (iconName: string): string | null => {
  for (const [categoryId, category] of Object.entries(iconCategories)) {
    if (category.icons.includes(iconName)) {
      return categoryId
    }
  }
  return null
}

// Verificar si un icono existe en las categorías
export const isValidIcon = (iconName: string): boolean => {
  return Object.values(iconCategories).some(category => 
    category.icons.includes(iconName)
  )
}

// Sugerencias de iconos basadas en palabras clave
export const suggestIcons = (keywords: string[]): string[] => {
  const suggestions: string[] = []
  
  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase()
    
    // Mapeo de palabras clave a iconos específicos
    const keywordMap: Record<string, string[]> = {
      'cocina': ['chef-hat', 'cooking-pot', 'microwave', 'refrigerator'],
      'baño': ['bath', 'shower-head', 'toilet', 'towel'],
      'dormitorio': ['bed', 'pillow', 'lamp', 'sofa'],
      'salon': ['tv', 'sofa', 'lamp', 'speaker'],
      'entrada': ['key', 'door-open', 'log-in', 'scan'],
      'salida': ['door-closed', 'log-out', 'key'],
      'wifi': ['wifi', 'router', 'signal', 'smartphone'],
      'parking': ['car', 'truck', 'motorcycle', 'bike'],
      'piscina': ['waves', 'swimming-pool', 'umbrella'],
      'emergencia': ['phone-call', 'siren', 'hospital', 'first-aid']
    }
    
    if (keywordMap[keywordLower]) {
      suggestions.push(...keywordMap[keywordLower])
    }
  })
  
  return Array.from(new Set(suggestions)).slice(0, 8)
}