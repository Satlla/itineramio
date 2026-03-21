import { createBatchZones } from './createBatchZones'

// Crear solo las 4 zonas básicas sin contenido
export async function crearZonasBasicas(propertyId: string): Promise<boolean> {
  const zonas = [
    { name: 'Check In', description: 'Proceso de entrada', icon: 'key', order: 1 },
    { name: 'WiFi', description: 'Conexión a internet', icon: 'wifi', order: 2 },
    { name: 'Check Out', description: 'Proceso de salida', icon: 'logout', order: 3 },
    { name: 'Contacto', description: 'Información de contacto', icon: 'phone', order: 4 }
  ]

  try {
    // Use batch API for reliability
    const zonesToCreate = zonas.map(zona => ({
      name: zona.name,
      description: zona.description,
      icon: zona.icon,
      status: 'ACTIVE'
    }))
    
    const success = await createBatchZones(propertyId, zonesToCreate)
    return success
  } catch (error) {
    return false
  }
}

export async function borrarTodasLasZonas(propertyId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/properties/${propertyId}/zones`)
    const result = await res.json()
    if (result.data) {
      for (const zone of result.data) {
        await fetch(`/api/properties/${propertyId}/zones/${zone.id}`, { method: 'DELETE' })
      }
    }
    return true
  } catch (error) {
    return false
  }
}