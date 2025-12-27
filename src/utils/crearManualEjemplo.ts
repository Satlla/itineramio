import { manualEjemploZones, type ManualZone, type ManualStep } from '../data/manualEjemplo'
import { createBatchZones } from './createBatchZones'

// Función para crear las zonas del manual de ejemplo
export async function crearManualEjemplo(propertyId: string): Promise<boolean> {
  try {
    console.log('🎨 Creando manual de ejemplo para propiedad:', propertyId)
    
    let zonasCreadas = 0
    
    // Prepare zones data for batch creation
    const zonesToCreate = manualEjemploZones.map(zona => ({
      name: zona.name,
      description: zona.description,
      icon: zona.icon,
      status: 'DRAFT' // Empezar como borrador para que puedan editarlo
    }))

    // Use batch API for reliability
    console.log('🚀 Using BATCH API for manual ejemplo creation')
    const success = await createBatchZones(propertyId, zonesToCreate)
    
    if (!success) {
      console.error('❌ Error creando zonas del manual de ejemplo')
      return false
    }

    // Get the created zones to add steps
    const zonesResponse = await fetch(`/api/properties/${propertyId}/zones`)
    const zonesResult = await zonesResponse.json()
    
    if (!zonesResult.success || !zonesResult.data) {
      console.error('❌ Error obteniendo zonas creadas')
      return false
    }

    const createdZones = zonesResult.data
    
    // Add steps to each zone
    for (const zona of manualEjemploZones) {
      // Find the created zone by name
      const createdZone = createdZones.find((z: any) => {
        const zoneName = typeof z.name === 'string' ? z.name : z.name?.es || z.name?.en || ''
        return zoneName.toLowerCase() === zona.name.toLowerCase()
      })
      
      if (!createdZone) {
        console.error(`❌ No se encontró la zona creada: ${zona.name}`)
        continue
      }
      
      const zoneId = createdZone.id
      console.log(`✅ Zona "${zona.name}" creada con ID:`, zoneId)

      // Crear los pasos de esta zona
      for (const step of zona.steps) {
        const stepResponse = await fetch(`/api/properties/${propertyId}/zones/${zoneId}/steps`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: step.title,
            description: step.description,
            type: step.content.type?.toUpperCase() || 'TEXT',
            content: step.content.text || step.description, // String directo, la API lo convierte
            mediaUrl: step.content.mediaUrl || undefined,
            linkUrl: step.content.linkUrl || undefined,
            order: step.order
          })
        })

        if (!stepResponse.ok) {
          console.error(`Error creando paso "${step.title}":`, await stepResponse.text())
          continue
        }

        const stepResult = await stepResponse.json()
        if (!stepResult.success) {
          console.error(`Error en respuesta de paso "${step.title}":`, stepResult.error)
          continue
        }

        console.log(`  ✅ Paso "${step.title}" creado`)
      }

      zonasCreadas++
    }

    console.log(`🎉 Manual de ejemplo creado: ${zonasCreadas} zonas`)
    return zonasCreadas > 0

  } catch (error) {
    console.error('❌ Error creando manual de ejemplo:', error)
    return false
  }
}

// Función para verificar si ya existe un manual de ejemplo
export async function tieneManualEjemplo(propertyId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/properties/${propertyId}/zones`)
    if (!response.ok) return false
    
    const result = await response.json()
    if (!result.success || !result.data) return false
    
    // Verificar si hay zonas que parecen del ejemplo
    const zones = result.data
    const titulosEjemplo = manualEjemploZones.map(z => z.name.toLowerCase())
    const zonasEjemplo = zones.filter((zone: any) => 
      titulosEjemplo.includes(zone.name.toLowerCase())
    )
    
    return zonasEjemplo.length >= 2 // Si tiene al menos 2 zonas del ejemplo
    
  } catch (error) {
    console.error('Error verificando manual de ejemplo:', error)
    return false
  }
}

// Función para marcar que el usuario ya vio el modal de bienvenida
export function marcarManualVisto(propertyId: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(`manual_ejemplo_visto_${propertyId}`, 'true')
  }
}

// Función para verificar si ya vio el modal
export function yaVioManual(propertyId: string): boolean {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(`manual_ejemplo_visto_${propertyId}`) === 'true'
  }
  return false
}

// Reset para testing
export function resetManualVisto(propertyId: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(`manual_ejemplo_visto_${propertyId}`)
  }
}