// Script para publicar la propiedad
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function publishProperty() {
  try {
    console.log('🚀 Publicando la propiedad...\n')
    
    // Buscar la propiedad
    const propertyId = 'cmcqppejj00027cbu1c9c3r6t'
    
    const property = await prisma.property.findFirst({
      where: { id: propertyId },
      include: {
        zones: {
          include: {
            steps: true
          }
        }
      }
    })
    
    if (!property) {
      console.log('❌ Propiedad no encontrada')
      return
    }
    
    console.log(`📋 Propiedad encontrada: ${property.name}`)
    console.log(`📊 Estado actual: ${property.isPublished ? 'PUBLICADA' : 'NO PUBLICADA'}`)
    console.log(`🏠 Zonas: ${property.zones.length}`)
    
    // Publicar la propiedad
    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: { 
        isPublished: true,
        publishedAt: new Date()
      }
    })
    
    console.log('\n✅ Propiedad publicada correctamente!')
    
    // También publicar las zonas que tengan pasos
    let zonesPublished = 0
    for (const zone of property.zones) {
      if (zone.steps.length > 0) {
        await prisma.zone.update({
          where: { id: zone.id },
          data: { 
            isPublished: true,
            publishedAt: new Date()
          }
        })
        zonesPublished++
        console.log(`📍 Zona publicada: ${zone.name}`)
      }
    }
    
    console.log(`\n🎉 Resumen:`)
    console.log(`   - Propiedad publicada: ✅`)
    console.log(`   - Zonas publicadas: ${zonesPublished}`)
    
    console.log(`\n📱 URLs que ahora funcionarán:`)
    console.log(`   🌐 https://www.itineramio.com/guide/${propertyId}`)
    console.log(`   🌐 https://www.itineramio.com/guide/villa-mediterranea-valencia`)
    console.log(`   💻 http://localhost:3000/guide/${propertyId}`)
    console.log(`   💻 http://localhost:3000/guide/villa-mediterranea-valencia`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

publishProperty()