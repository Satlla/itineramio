import { manualEjemploSimple } from '../data/manualEjemploSimple'

export async function crearManualSimple(propertyId: string): Promise<boolean> {
  try {
    console.log('🚀 Creando manual simple para:', propertyId)
    
    for (const zona of manualEjemploSimple) {
      // 1. Crear zona
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

      // 2. Crear steps
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
          console.error('Error creando step:', await stepRes.text())
        } else {
          console.log(`  ✅ Step "${step.title}" creado`)
        }
      }
    }

    return true
  } catch (error) {
    console.error('❌ Error:', error)
    return false
  }
}