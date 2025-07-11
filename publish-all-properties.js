// Script para publicar todas las propiedades y zonas con pasos
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function publishAllProperties() {
  try {
    console.log('🚀 Publicando todas las propiedades con contenido...\n')
    
    // Buscar todas las propiedades que tienen zonas con pasos
    const properties = await prisma.property.findMany({
      include: {
        zones: {
          include: {
            steps: true
          }
        }
      }
    })
    
    console.log(`📊 Total de propiedades encontradas: ${properties.length}`)
    
    let publishedCount = 0
    let zonesPublishedCount = 0
    
    for (const property of properties) {
      const zonesWithSteps = property.zones.filter(z => z.steps.length > 0)
      
      if (zonesWithSteps.length > 0) {
        // Publicar la propiedad
        await prisma.property.update({
          where: { id: property.id },
          data: { 
            isPublished: true,
            publishedAt: new Date()
          }
        })
        publishedCount++
        
        console.log(`\n✅ Publicando: ${property.name}`)
        console.log(`   ID: ${property.id}`)
        
        // Publicar todas las zonas que tienen pasos
        for (const zone of zonesWithSteps) {
          await prisma.zone.update({
            where: { id: zone.id },
            data: { 
              isPublished: true,
              publishedAt: new Date()
            }
          })
          
          // Publicar todos los pasos de la zona
          await prisma.step.updateMany({
            where: { zoneId: zone.id },
            data: { 
              isPublished: true,
              publishedAt: new Date()
            }
          })
          
          zonesPublishedCount++
          console.log(`   📍 Zona publicada: ${zone.name} (${zone.steps.length} pasos)`)
        }
        
        console.log(`   🌐 URL: https://www.itineramio.com/guide/${property.id}`)
      } else {
        console.log(`\n⚠️  Saltando: ${property.name} (sin zonas con contenido)`)
      }
    }
    
    console.log(`\n\n🎉 Resumen:`)
    console.log(`   - Propiedades publicadas: ${publishedCount}`)
    console.log(`   - Zonas publicadas: ${zonesPublishedCount}`)
    
    // Verificar propiedades específicas
    const testIds = [
      'cmcqppejj00027cbu1c9c3r6t',
      'cmcqq5nf30001lb043htv4xij'
    ]
    
    console.log('\n\n🔍 Verificando propiedades específicas:')
    for (const testId of testIds) {
      const property = await prisma.property.findFirst({
        where: { id: testId },
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
      
      if (property) {
        console.log(`\n   ✅ ${property.name}`)
        console.log(`      ID: ${testId}`)
        console.log(`      Publicada: ${property.isPublished ? 'SÍ' : 'NO'}`)
        console.log(`      URL: https://www.itineramio.com/guide/${testId}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

publishAllProperties()