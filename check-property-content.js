// Script para verificar contenido de la propiedad
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkPropertyContent() {
  try {
    const propertyId = 'cmcqppejj00027cbu1c9c3r6t'
    
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        zones: {
          include: {
            steps: {
              where: { isPublished: true }
            }
          }
        }
      }
    })
    
    console.log(`🏠 Propiedad: ${property.name}`)
    console.log(`📊 Publicada: ${property.isPublished ? 'SÍ' : 'NO'}`)
    console.log(`🏗️ Zonas totales: ${property.zones.length}`)
    
    property.zones.forEach(zone => {
      console.log(`\n📍 Zona: ${zone.name}`)
      console.log(`   - Publicada: ${zone.isPublished ? 'SÍ' : 'NO'}`)
      console.log(`   - Pasos publicados: ${zone.steps.length}`)
    })
    
    const publishedZones = property.zones.filter(z => z.isPublished || z.steps.length > 0)
    console.log(`\n✅ Zonas con contenido público: ${publishedZones.length}`)
    
    if (publishedZones.length === 0) {
      console.log('\n⚠️  La propiedad no tiene zonas publicadas. Publicando todas las zonas con contenido...')
      
      for (const zone of property.zones) {
        if (zone.steps.length > 0) {
          await prisma.zone.update({
            where: { id: zone.id },
            data: { 
              isPublished: true,
              publishedAt: new Date()
            }
          })
          console.log(`✅ Zona publicada: ${zone.name}`)
        }
      }
    }
    
    console.log(`\n🌐 URL pública: https://www.itineramio.com/guide/${propertyId}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPropertyContent()