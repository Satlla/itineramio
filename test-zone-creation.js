// Quick test script for zone creation
const testZoneCreation = async () => {
  const propertyId = 'cmd01rd660003jr047ahyxxqt'
  const testData = {
    name: 'Test WiFi Zone Debug',
    description: 'Test description for debugging',
    icon: 'wifi',
    color: 'bg-blue-100',
    status: 'ACTIVE'
  }
  
  try {
    const response = await fetch(`https://www.itineramio.com/api/properties/${propertyId}/zones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })
    
    const result = await response.json()
    console.log('Status:', response.status)
    console.log('Result:', result)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

testZoneCreation()