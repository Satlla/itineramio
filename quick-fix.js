// Script simple para verificar si la API funciona
console.log('🔍 Verificando API de la propiedad...')

const propertyId = 'cmcqppejj00027cbu1c9c3r6t'

// Test local API
async function testAPI() {
  try {
    console.log('📡 Probando API local...')
    
    const response = await fetch(`http://localhost:3000/api/public/properties/${propertyId}`)
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ API local funciona!')
      console.log(`📊 Propiedad: ${result.data.name}`)
      console.log(`🏠 Zonas: ${result.data.zones.length}`)
      console.log(`🌐 URL local: http://localhost:3000/guide/${propertyId}`)
    } else {
      console.log('❌ Error en API local:', result.error)
    }
  } catch (error) {
    console.log('❌ Error conectando a API local:', error.message)
  }
}

testAPI()