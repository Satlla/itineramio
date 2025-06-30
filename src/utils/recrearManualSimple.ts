import { manualEjemploSimple } from '../data/manualEjemploSimple'

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
      if (nombresEjemplo.includes(zone.name.toLowerCase())) {
        console.log(`🗑️ Borrando zona existente: ${zone.name}`)
        await fetch(`/api/properties/${propertyId}/zones/${zone.id}`, {
          method: 'DELETE'
        })
      }
    }
  } catch (error) {
    console.error('Error borrando zonas:', error)
  }
}

// Función principal para recrear el manual
export async function recrearManualSimple(propertyId: string): Promise<boolean> {
  try {
    console.log('🔄 Recreando manual simple para:', propertyId)
    
    // 1. Borrar zonas existentes
    await borrarZonasEjemplo(propertyId)
    
    // Pequeña pausa para asegurar que se borraron
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 2. Crear nuevas zonas
    for (const zona of manualEjemploSimple) {
      const zoneRes = await fetch(`/api/properties/${propertyId}/zones`, {
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

      if (!zoneRes.ok) {
        console.error('Error creando zona:', await zoneRes.text())
        continue
      }

      const zoneData = await zoneRes.json()
      const zoneId = zoneData.data.id
      console.log(`✅ Zona ${zona.name} creada:`, zoneId)

      // 3. Crear steps con descripción adicional
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
        
        console.log(`  📝 Creando step:`, stepData.title)
        
        const stepRes = await fetch(`/api/properties/${propertyId}/zones/${zoneId}/steps`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stepData)
        })

        if (!stepRes.ok) {
          const errorText = await stepRes.text()
          console.error('Error creando step:', errorText)
        } else {
          const stepResult = await stepRes.json()
          console.log(`  ✅ Step creado:`, stepResult.data.id)
        }
      }
    }

    return true
  } catch (error) {
    console.error('❌ Error recreando manual:', error)
    return false
  }
}