// Zonas esenciales expandidas para apartamentos (sin cocina)
export const zonasEsenciales = [
  {
    name: 'Check In',
    description: 'Proceso de entrada al apartamento',
    icon: 'key',
    order: 1
  },
  {
    name: 'WiFi',
    description: 'Información de conexión a internet',
    icon: 'wifi', 
    order: 2
  },
  {
    name: 'Check Out',
    description: 'Instrucciones para la salida',
    icon: 'exit',
    order: 3
  },
  {
    name: 'Cómo Llegar',
    description: 'Direcciones desde aeropuerto, estación y ubicación exacta',
    icon: 'map-pin',
    order: 4
  },
  {
    name: 'Normas de la Casa',
    description: 'Reglas y políticas del apartamento',
    icon: 'list',
    order: 5
  },
  {
    name: 'Parking',
    description: 'Información sobre aparcamiento',
    icon: 'car',
    order: 6
  },
  {
    name: 'Climatización',
    description: 'Aire acondicionado y calefacción',
    icon: 'thermometer',
    order: 7
  },
  {
    name: 'Teléfonos de Emergencia',
    description: 'Contactos importantes y anfitrión',
    icon: 'phone',
    order: 8
  },
  {
    name: 'Transporte Público',
    description: 'Metro, autobús y opciones de movilidad',
    icon: 'bus',
    order: 9
  },
  {
    name: 'Recomendaciones',
    description: 'Restaurantes, tiendas y lugares de interés',
    icon: 'star',
    order: 10
  },
  {
    name: 'Basura y Reciclaje',
    description: 'Cómo y dónde desechar la basura',
    icon: 'trash',
    order: 11
  }
]

export async function crearZonasEsenciales(propertyId: string): Promise<boolean> {
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
    
    for (const zona of zonasEsenciales) {
      // Skip if zone already exists
      if (existingZoneNames.includes(zona.name.toLowerCase())) {
        console.log(`Skipping duplicate zone: ${zona.name}`)
        continue
      }
      
      // First try debug endpoint
      const debugResponse = await fetch(`/api/properties/${propertyId}/zones/debug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: zona.name,
          description: zona.description,
          icon: zona.icon,
          order: zona.order,
          status: 'ACTIVE',
          isPublished: true
        })
      })
      
      if (debugResponse.ok) {
        const debugData = await debugResponse.json()
        console.log(`🔍 Debug for zone "${zona.name}":`, debugData)
        
        if (!debugData.success) {
          console.error(`❌ Debug errors for "${zona.name}":`, debugData.errors)
        }
      }
      
      // Now try actual creation
      const response = await fetch(`/api/properties/${propertyId}/zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: zona.name,
          description: zona.description,
          icon: zona.icon,
          order: zona.order,
          status: 'ACTIVE',
          isPublished: true
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
      console.log(`✅ Zona "${zona.name}" creada:`, result.data.id)
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