interface ZoneContentStep {
  type: 'text' | 'image' | 'link'
  title: { es: string; en: string; fr: string }
  content: { es: string; en: string; fr: string }
}

type MultilingualText = { es?: string; en?: string; fr?: string } | string

export async function createBatchZones(propertyId: string, zones: Array<{
  name: MultilingualText
  description: MultilingualText
  icon: string
  color?: string
  status?: string
  steps?: ZoneContentStep[]
}>, useTemplates: boolean = false) {
  try {
    const response = await fetch(`/api/properties/${propertyId}/zones/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        zones: zones.map(zone => ({
          name: zone.name,
          description: zone.description,
          icon: zone.icon,
          color: 'bg-gray-100',
          status: zone.status || 'ACTIVE',
          steps: zone.steps
        })),
        useTemplates
      })
    })
    
    if (!response.ok) {
      const errorData = await response.text()

      try {
        const errorJson = JSON.parse(errorData)
        throw new Error(errorJson.error || 'Error al crear las zonas')
      } catch {
        throw new Error(`Error ${response.status}: ${errorData}`)
      }
    }
    
    const result = await response.json()

    return result
  } catch (error) {
    throw error
  }
}