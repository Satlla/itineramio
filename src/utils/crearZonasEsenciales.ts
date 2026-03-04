import { getZoneContentTemplate } from '../data/zone-content-templates'

// Zonas esenciales expandidas para apartamentos (sin cocina)
// templateId maps to zone-content-templates.ts keys
// All names and descriptions are multilingual (ES/EN/FR)
export const zonasEsenciales = [
  {
    name: {
      es: 'Check In',
      en: 'Check In',
      fr: 'Enregistrement'
    },
    description: {
      es: 'Proceso de entrada al apartamento',
      en: 'Apartment check-in process',
      fr: 'Processus d\'enregistrement à l\'appartement'
    },
    icon: 'key',
    order: 1,
    templateId: 'check-in'
  },
  {
    name: {
      es: 'WiFi',
      en: 'WiFi',
      fr: 'WiFi'
    },
    description: {
      es: 'Información de conexión a internet',
      en: 'Internet connection information',
      fr: 'Informations de connexion internet'
    },
    icon: 'wifi',
    order: 2,
    templateId: 'wifi'
  },
  {
    name: {
      es: 'Check Out',
      en: 'Check Out',
      fr: 'Départ'
    },
    description: {
      es: 'Instrucciones para la salida',
      en: 'Check-out instructions',
      fr: 'Instructions de départ'
    },
    icon: 'exit',
    order: 3,
    templateId: 'check-out'
  },
  {
    name: {
      es: 'Cómo Llegar',
      en: 'How to Get Here',
      fr: 'Comment Arriver'
    },
    description: {
      es: 'Direcciones desde aeropuerto, estación y ubicación exacta',
      en: 'Directions from airport, station and exact location',
      fr: 'Itinéraire depuis l\'aéroport, la gare et localisation exacte'
    },
    icon: 'map-pin',
    order: 4,
    templateId: 'directions'
  },
  {
    name: {
      es: 'Normas de la Casa',
      en: 'House Rules',
      fr: 'Règles de la Maison'
    },
    description: {
      es: 'Reglas y políticas del apartamento',
      en: 'Apartment rules and policies',
      fr: 'Règles et politiques de l\'appartement'
    },
    icon: 'list',
    order: 5,
    templateId: 'house-rules'
  },
  {
    name: {
      es: 'Climatización',
      en: 'Climate Control',
      fr: 'Climatisation'
    },
    description: {
      es: 'Aire acondicionado y calefacción',
      en: 'Air conditioning and heating',
      fr: 'Climatisation et chauffage'
    },
    icon: 'thermometer',
    order: 6,
    templateId: 'heating'
  },
  {
    name: {
      es: 'Teléfonos de Emergencia',
      en: 'Emergency Contacts',
      fr: 'Contacts d\'Urgence'
    },
    description: {
      es: 'Contactos importantes y anfitrión',
      en: 'Important contacts and host',
      fr: 'Contacts importants et hôte'
    },
    icon: 'phone',
    order: 7,
    templateId: 'emergency-contacts'
  },
  {
    name: {
      es: 'Transporte Público',
      en: 'Public Transport',
      fr: 'Transports en Commun'
    },
    description: {
      es: 'Metro, autobús y opciones de movilidad',
      en: 'Metro, bus and mobility options',
      fr: 'Métro, bus et options de mobilité'
    },
    icon: 'bus',
    order: 8,
    templateId: 'public-transport'
  },
  {
    name: {
      es: 'Recomendaciones',
      en: 'Recommendations',
      fr: 'Recommandations'
    },
    description: {
      es: 'Restaurantes, tiendas y lugares de interés',
      en: 'Restaurants, shops and points of interest',
      fr: 'Restaurants, boutiques et points d\'intérêt'
    },
    icon: 'star',
    order: 9,
    templateId: 'recommendations'
  },
  {
    name: {
      es: 'Basura y Reciclaje',
      en: 'Trash & Recycling',
      fr: 'Poubelles et Recyclage'
    },
    description: {
      es: 'Cómo y dónde desechar la basura',
      en: 'How and where to dispose of trash',
      fr: 'Comment et où jeter les déchets'
    },
    icon: 'trash',
    order: 10,
    templateId: 'recycling'
  }
]

// Helper to get zone name text (supports both string and multilingual object)
const getZoneName = (name: string | { es: string; en: string; fr: string }): string => {
  if (typeof name === 'string') return name
  return name.es || name.en || name.fr || ''
}

export async function crearZonasEsenciales(
  propertyId: string,
  onProgress?: (current: number, total: number) => void
): Promise<boolean> {
  try {
    console.log('🏠 Creando zonas esenciales básicas para:', propertyId)

    // First, get existing zones to avoid duplicates
    const existingResponse = await fetch(`/api/properties/${propertyId}/zones`, {
      credentials: 'include'
    })
    const existingResult = await existingResponse.json()
    const existingZoneNames = existingResult.success ?
      existingResult.data.map((zone: any) => {
        const name = typeof zone.name === 'string' ? zone.name : zone.name?.es || zone.name?.en || ''
        return name.toLowerCase()
      }) : []

    console.log('Existing zones:', existingZoneNames)

    let createdCount = 0
    const totalZones = zonasEsenciales.length

    for (const zona of zonasEsenciales) {
      // Get the Spanish name for comparison (primary language)
      const zoneName = getZoneName(zona.name)

      // Skip if zone already exists
      if (existingZoneNames.includes(zoneName.toLowerCase())) {
        console.log(`Skipping duplicate zone: ${zoneName}`)
        continue
      }

      // Get content template if available
      const contentTemplate = zona.templateId ? getZoneContentTemplate(zona.templateId) : null

      // Use batch API ALWAYS for reliability
      console.log(`🚀 Creating zone "${zoneName}" via BATCH API`, contentTemplate ? `with ${contentTemplate.steps.length} template steps` : 'without template')
      const response = await fetch(`/api/properties/${propertyId}/zones/batch`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zones: [{
            name: zona.name,        // Pass full multilingual object
            description: zona.description, // Pass full multilingual object
            icon: zona.icon,
            color: 'bg-gray-100',
            status: 'ACTIVE',
            steps: contentTemplate?.steps // Include pre-filled steps if template exists
          }],
          useTemplates: !!contentTemplate
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Error creando zona "${zoneName}":`, response.status, errorText)

        // Try to parse as JSON for more details
        try {
          const errorData = JSON.parse(errorText)
          console.error('Error details:', errorData)
        } catch (e) {
          // Not JSON, just log the text
        }
        continue
      }

      const result = await response.json()
      if (result.success && result.data?.zones?.length > 0) {
        console.log(`✅ Zona "${zoneName}" creada via batch:`, result.data.zones[0].id)
        createdCount++
        // Call progress callback
        if (onProgress) {
          onProgress(createdCount, totalZones)
        }
      } else {
        console.error(`❌ Batch result failed for "${zoneName}":`, result)
      }
    }

    return true
  } catch (error) {
    console.error('❌ Error creando zonas esenciales:', error)
    return false
  }
}

export async function borrarTodasLasZonas(propertyId: string): Promise<boolean> {
  try {
    // Obtener todas las zonas
    const response = await fetch(`/api/properties/${propertyId}/zones`, {
      credentials: 'include'
    })
    if (!response.ok) return false

    const result = await response.json()
    if (!result.success || !result.data) return false

    // Borrar cada zona
    for (const zone of result.data) {
      await fetch(`/api/properties/${propertyId}/zones/${zone.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      console.log(`🗑️ Zona "${zone.name}" eliminada`)
    }

    return true
  } catch (error) {
    console.error('Error borrando zonas:', error)
    return false
  }
}