import { manualEjemploSimple } from '../data/manualEjemploSimple'
import { createBatchZones } from './createBatchZones'

export async function crearManualSimple(propertyId: string): Promise<boolean> {
  try {
    // 1. Crear zonas usando batch API
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

    // 2. Add steps to each zone
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

      // 3. Crear steps
      for (const step of zona.steps) {
        const stepRes = await fetch(`/api/properties/${propertyId}/zones/${zoneId}/steps`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: step.title,
            type: step.type,
            content: step.content,
            mediaUrl: step.mediaUrl,
            order: step.order
          })
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