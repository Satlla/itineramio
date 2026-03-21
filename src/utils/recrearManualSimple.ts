import { manualEjemploSimple } from '../data/manualEjemploSimple'
import { createBatchZones } from './createBatchZones'

// Función para borrar zonas de ejemplo existentes
async function borrarZonasEjemplo(propertyId: string): Promise<void> {
  try {
    // Obtener zonas existentes
    const response = await fetch(`/api/properties/${propertyId}/zones`)
    if (!response.ok) return
    
    const result = await response.json()
    if (!result.success || !result.data) return
    
    // Buscar zonas que coincidan con el manual de ejemplo
    const zones = result.data
    const nombresEjemplo = manualEjemploSimple.map(z => z.name.toLowerCase())
    
    for (const zone of zones) {
      const zoneName = typeof zone.name === 'string' ? zone.name : zone.name?.es || ''
      if (nombresEjemplo.includes(zoneName.toLowerCase())) {
        await fetch(`/api/properties/${propertyId}/zones/${zone.id}`, {
          method: 'DELETE'
        })
      }
    }
  } catch (error) {
    // Ignore zone deletion errors
  }
}

// Función principal para recrear el manual
export async function recrearManualSimple(propertyId: string): Promise<boolean> {
  try {
    // 1. Borrar zonas existentes
    await borrarZonasEjemplo(propertyId)
    
    // Pequeña pausa para asegurar que se borraron
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 2. Crear nuevas zonas usando batch API
    const zonesToCreate = manualEjemploSimple.map(zona => ({
      name: zona.name,
      description: zona.description,
      icon: zona.icon,
      status: 'ACTIVE'
    }))

    const success = await createBatchZones(propertyId, zonesToCreate)

    if (!success) {
      return false
    }

    // Get the created zones to add steps
    const zonesResponse = await fetch(`/api/properties/${propertyId}/zones`)
    const zonesResult = await zonesResponse.json()

    if (!zonesResult.success || !zonesResult.data) {
      return false
    }

    const createdZones = zonesResult.data

    // 3. Add steps to each zone
    for (const zona of manualEjemploSimple) {
      // Find the created zone by name
      const createdZone = createdZones.find((z: any) => {
        const zoneName = typeof z.name === 'string' ? z.name : z.name?.es || z.name?.en || ''
        return zoneName.toLowerCase() === zona.name.toLowerCase()
      })
      
      if (!createdZone) {
        continue
      }

      const zoneId = createdZone.id

      // 4. Crear steps con descripción adicional
      for (const step of zona.steps) {
        // Para steps de tipo TEXT, asegurar que tengan descripción
        const stepData = {
          title: step.title,
          description: step.content, // Usar content como descripción también
          type: step.type,
          content: step.content,
          mediaUrl: step.mediaUrl,
          order: step.order
        }
        
        const stepRes = await fetch(`/api/properties/${propertyId}/zones/${zoneId}/steps`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stepData)
        })

        if (!stepRes.ok) {
          await stepRes.text()
        }
      }
    }

    return true
  } catch (error) {
    return false
  }
}