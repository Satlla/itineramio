// Script para publicar propiedad específica
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixSpecificProperty() {
  try {
    const propertyId = 'cmcyzir6x0001l804a7j20gig'
    
    console.log(`🔍 Buscando propiedad: ${propertyId}`)
    
    // Verificar si la propiedad existe
    const property = await prisma.property.findUnique({
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
      console.log('❌ Propiedad no encontrada en la base de datos')
      
      // Listar propiedades disponibles
      const allProperties = await prisma.property.findMany({
        select: {
          id: true,
          name: true,
          isPublished: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      })
      
      console.log('\n📋 Propiedades disponibles (últimas 10):')
      allProperties.forEach(p => {
        console.log(`   ${p.isPublished ? '✅' : '❌'} ${p.name} - ID: ${p.id}`)
      })
      
      return
    }
    
    console.log(`✅ Propiedad encontrada: ${property.name}`)
    console.log(`📊 Estado actual: ${property.isPublished ? 'PUBLICADA' : 'NO PUBLICADA'}`)
    console.log(`🏠 Zonas: ${property.zones.length}`)
    
    // Publicar la propiedad
    await prisma.property.update({
      where: { id: propertyId },
      data: {
        isPublished: true,
        publishedAt: new Date()
      }
    })
    
    console.log('\n✅ Propiedad publicada!')
    
    // Publicar zonas con contenido
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
        
        // Publicar pasos
        await prisma.step.updateMany({
          where: { zoneId: zone.id },
          data: {
            isPublished: true,
            publishedAt: new Date()
          }
        })
        
        zonesPublished++
        console.log(`📍 Zona publicada: ${zone.name} (${zone.steps.length} pasos)`)
      }
    }
    
    console.log(`\n🎉 Resumen:`)
    console.log(`   - Propiedad: ✅ Publicada`)
    console.log(`   - Zonas publicadas: ${zonesPublished}`)
    console.log(`\n🌐 URL pública:`)
    console.log(`   https://www.itineramio.com/guide/${propertyId}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSpecificProperty()