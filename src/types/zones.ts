export interface ZoneIcon {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  category: ZoneCategory
  color: string
}

export interface ZoneCategory {
  id: string
  name: string
  color: string
}

export interface ZoneType {
  id: string
  name: string
  description: string
  iconId: string
  suggestedSteps: string[]
}

export const ZONE_CATEGORIES: ZoneCategory[] = [
  {
    id: 'kitchen',
    name: 'Cocina',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    id: 'bedroom',
    name: 'Dormitorio',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'bathroom',
    name: 'Baño',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200'
  },
  {
    id: 'living',
    name: 'Salón',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    id: 'entrance',
    name: 'Entrada',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    id: 'outdoor',
    name: 'Exterior',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    id: 'appliances',
    name: 'Electrodomésticos',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  {
    id: 'utilities',
    name: 'Servicios',
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  }
]