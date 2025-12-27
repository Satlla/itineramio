import { getZoneContentTemplate } from '../data/zone-content-templates'

// Zonas esenciales expandidas para apartamentos (sin cocina)
// templateId maps to zone-content-templates.ts keys
export const zonasEsenciales = [
  {
    name: 'Check In',
    description: 'Proceso de entrada al apartamento',
    icon: 'key',
    order: 1,
    templateId: 'check-in'
  },
  {
    name: 'WiFi',
    description: 'Información de conexión a internet',
    icon: 'wifi',
    order: 2,
    templateId: 'wifi'
  },
  {
    name: 'Check Out',
    description: 'Instrucciones para la salida',
    icon: 'exit',
    order: 3,
    templateId: 'check-out'
  },
  {
    name: 'Cómo Llegar',
    description: 'Direcciones desde aeropuerto, estación y ubicación exacta',
    icon: 'map-pin',
    order: 4,
    templateId: 'directions'
  },
  {
    name: 'Normas de la Casa',
    description: 'Reglas y políticas del apartamento',
    icon: 'list',
    order: 5,
    templateId: 'house-rules'
  },
  {
    name: 'Parking',
    description: 'Información sobre aparcamiento',
    icon: 'car',
    order: 6,
    templateId: 'parking'
  },
  {
    name: 'Climatización',
    description: 'Aire acondicionado y calefacción',
    icon: 'thermometer',
    order: 7,
    templateId: 'heating' // Uses heating template
  },
  {
    name: 'Teléfonos de Emergencia',
    description: 'Contactos importantes y anfitrión',
    icon: 'phone',
    order: 8,
    templateId: 'emergency-contacts'
  },
  {
    name: 'Transporte Público',
    description: 'Metro, autobús y opciones de movilidad',
    icon: 'bus',
    order: 9,
    templateId: 'public-transport'
  },
  {
    name: 'Recomendaciones',
    description: 'Restaurantes, tiendas y lugares de interés',
    icon: 'star',
    order: 10,
    templateId: 'recommendations'
  },
  {
    name: 'Basura y Reciclaje',
    description: 'Cómo y dónde desechar la basura',
    icon: 'trash',
    order: 11,
    templateId: 'recycling'
  }
]

export async function crearZonasEsenciales(
  propertyId: string,
  onProgress?: (current: number, total: number) => void
): Promise<boolean> {
  try {
    console.log('🏠 Creando zonas esenciales básicas para:', propertyId)

    // First, get existing zones to avoid duplicates
    const existingResponse = await fetch(`/api/properties/${propertyId}/zones`)
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
      // Skip if zone already exists
      if (existingZoneNames.includes(zona.name.toLowerCase())) {
        console.log(`Skipping duplicate zone: ${zona.name}`)
        continue
      }
      
      // Get content template if available
      const contentTemplate = zona.templateId ? getZoneContentTemplate(zona.templateId) : null

      // Use batch API ALWAYS for reliability
      console.log(`🚀 Creating zone "${zona.name}" via BATCH API`, contentTemplate ? `with ${contentTemplate.steps.length} template steps` : 'without template')
      const response = await fetch(`/api/properties/${propertyId}/zones/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zones: [{
            name: zona.name,
            description: zona.description,
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
        console.error(`❌ Error creando zona "${zona.name}":`, response.status, errorText)
        
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
        console.log(`✅ Zona "${zona.name}" creada via batch:`, result.data.zones[0].id)
        createdCount++
        // Call progress callback
        if (onProgress) {
          onProgress(createdCount, totalZones)
        }
      } else {
        console.error(`❌ Batch result failed for "${zona.name}":`, result)
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
    const response = await fetch(`/api/properties/${propertyId}/zones`)
    if (!response.ok) return false
    
    const result = await response.json()
    if (!result.success || !result.data) return false
    
    // Borrar cada zona
    for (const zone of result.data) {
      await fetch(`/api/properties/${propertyId}/zones/${zone.id}`, {
        method: 'DELETE'
      })
      console.log(`🗑️ Zona "${zone.name}" eliminada`)
    }

    return true
  } catch (error) {
    console.error('Error borrando zonas:', error)
    return false
  }
}