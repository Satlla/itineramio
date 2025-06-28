import { manualEjemploZones, type ManualZone, type ManualStep } from '../data/manualEjemplo'

// Función para crear las zonas del manual de ejemplo
export async function crearManualEjemplo(propertyId: string): Promise<boolean> {
  try {
    console.log('🎨 Creando manual de ejemplo para propiedad:', propertyId)
    
    let zonasCreadas = 0
    
    for (const zona of manualEjemploZones) {
      // Crear la zona
      const zoneResponse = await fetch(`/api/properties/${propertyId}/zones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: zona.name,
          description: zona.description,
          icon: zona.icon,
          order: zona.order,
          status: 'DRAFT', // Empezar como borrador para que puedan editarlo
          isExample: true // Marcar como ejemplo
        })
      })

      if (!zoneResponse.ok) {
        console.error(`Error creando zona ${zona.name}:`, await zoneResponse.text())
        continue
      }

      const zoneResult = await zoneResponse.json()
      if (!zoneResult.success) {
        console.error(`Error en respuesta de zona ${zona.name}:`, zoneResult.error)
        continue
      }

      const zoneId = zoneResult.data.id
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
            content: {
              type: step.content.type,
              text: step.content.text,
              mediaUrl: step.content.mediaUrl,
              thumbnail: step.content.thumbnail,
              duration: step.content.duration,
              linkUrl: step.content.linkUrl,
              linkText: step.content.linkText,
              discountCode: step.content.discountCode,
              wifiData: step.content.wifiData,
              checklistItems: step.content.checklistItems
            },
            order: step.order,
            isVisible: true,
            variables: step.variables // Para que sepan qué pueden personalizar
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
  localStorage.setItem(`manual_ejemplo_visto_${propertyId}`, 'true')
}

// Función para verificar si ya vio el modal
export function yaVioManual(propertyId: string): boolean {
  return localStorage.getItem(`manual_ejemplo_visto_${propertyId}`) === 'true'
}

// Reset para testing
export function resetManualVisto(propertyId: string) {
  localStorage.removeItem(`manual_ejemplo_visto_${propertyId}`)
}