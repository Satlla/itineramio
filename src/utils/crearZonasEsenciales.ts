// Crear solo las zonas esenciales SIN steps
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
    icon: 'logout',
    order: 3
  },
  {
    name: 'Contacto de Emergencia',
    description: 'Números importantes y contacto del anfitrión',
    icon: 'phone',
    order: 4
  }
]

export async function crearZonasEsenciales(propertyId: string): Promise<boolean> {
  try {
    console.log('🏠 Creando zonas esenciales básicas para:', propertyId)
    
    for (const zona of zonasEsenciales) {
      const response = await fetch(`/api/properties/${propertyId}/zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: zona.name,
          description: zona.description,
          icon: zona.icon,
          order: zona.order,
          status: 'DRAFT', // Empezar como borrador
          isPublished: false
        })
      })

      if (!response.ok) {
        console.error('Error creando zona:', await response.text())
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