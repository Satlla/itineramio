/**
 * Test script to create an announcement and see the actual error
 */

const propertyId = 'prop-1763705990370-mgh7wewxc6' // Property ID from existing announcements

console.log('🧪 Testing announcement creation with JSONB format...\n')

const testData = {
  propertyId,
  title: { es: 'TEST AVISO', en: 'TEST ANNOUNCEMENT', fr: 'TEST ANNONCE' },
  message: {
    es: 'Este es un mensaje de prueba en español',
    en: 'This is a test message in English',
    fr: 'Ceci est un message de test en français'
  },
  category: 'other',
  priority: 'NORMAL',
  isActive: true,
  startDate: null,
  endDate: null
}

console.log('📤 Datos a enviar:', JSON.stringify(testData, null, 2))

fetch('http://localhost:3000/api/announcements', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbTRrb2U4aHAwMDAwOHlpeWFtNHJ5ajBhIiwiaWF0IjoxNzM0MDM5MjUyLCJleHAiOjE3MzY2MzEyNTJ9.8k_Zdt0sHASU9LS5o8oqE8aWX4XO7uOSqhoPZtP-PFY'
  },
  body: JSON.stringify(testData)
})
  .then(async response => {
    console.log('\n📨 Response status:', response.status, response.statusText)
    const data = await response.json()
    console.log('📦 Response data:', JSON.stringify(data, null, 2))

    if (!response.ok) {
      console.error('\n❌ ERROR DETECTADO')
    } else {
      console.log('\n✅ Aviso creado correctamente!')
    }
  })
  .catch(error => {
    console.error('\n💥 Error en la petición:', error)
  })
