import { manualEjemploZones } from '../data/manualEjemplo'

// Función para agregar steps a zonas existentes
export async function agregarStepsAZonasExistentes(propertyId: string) {
  try {
    // Primero obtener las zonas existentes
    const zonesResponse = await fetch(`/api/properties/${propertyId}/zones`)
    if (!zonesResponse.ok) {
      return false
    }

    const zonesResult = await zonesResponse.json()
    if (!zonesResult.success || !zonesResult.data) {
      return false
    }
    
    const existingZones = zonesResult.data
    let stepsAdded = 0
    
    // Para cada zona del manual ejemplo
    for (const zonaEjemplo of manualEjemploZones) {
      // Buscar si existe una zona con el mismo nombre
      const zonaExistente = existingZones.find((z: any) => 
        z.name.toLowerCase() === zonaEjemplo.name.toLowerCase()
      )
      
      if (!zonaExistente) {
        continue
      }

      // Crear cada step
      for (const step of zonaEjemplo.steps) {
        try {
          const stepData = {
            title: step.title,
            description: step.description,
            type: step.content.type,
            content: step.content.text || '',
            mediaUrl: step.content.mediaUrl || '',
            thumbnail: step.content.thumbnail || '',
            duration: step.content.duration || 0,
            linkUrl: step.content.linkUrl || '',
            linkText: step.content.linkText || '',
            discountCode: step.content.discountCode || '',
            wifiData: step.content.wifiData || null,
            checklistItems: step.content.checklistItems || [],
            order: step.order,
            isVisible: true
          }
          
          const stepResponse = await fetch(`/api/properties/${propertyId}/zones/${zonaExistente.id}/steps`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(stepData)
          })
          
          if (!stepResponse.ok) {
            // Intentar con formato alternativo
            const altStepData = {
              title: step.title,
              content: step.content.text || '',
              type: step.content.type,
              order: step.order
            }
            
            const altResponse = await fetch(`/api/properties/${propertyId}/zones/${zonaExistente.id}/steps`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(altStepData)
            })
            
            if (altResponse.ok) {
              stepsAdded++
            }
          } else {
            stepsAdded++
          }
        } catch (error) {
          // Ignore step creation errors
        }
      }
    }

    return stepsAdded > 0

  } catch (error) {
    return false
  }
}

// Función helper para ejecutar desde la consola del navegador
export function agregarStepsDesdeConsola(propertyId: string) {
  agregarStepsAZonasExistentes(propertyId).then(result => {
    if (result) {
      window.location.reload()
    }
  })
}