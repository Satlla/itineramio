export async function createBatchZones(propertyId: string, zones: Array<{
  name: string
  description: string
  icon: string
  status?: string
}>) {
  try {
    console.log('🚀 Creating batch zones:', zones.length)
    
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
          status: zone.status || 'ACTIVE'
        }))
      })
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ Batch creation failed:', response.status, errorData)
      
      try {
        const errorJson = JSON.parse(errorData)
        throw new Error(errorJson.error || 'Error al crear las zonas')
      } catch {
        throw new Error(`Error ${response.status}: ${errorData}`)
      }
    }
    
    const result = await response.json()
    console.log('✅ Batch creation successful:', result)
    
    return result
  } catch (error) {
    console.error('❌ Error in createBatchZones:', error)
    throw error
  }
}