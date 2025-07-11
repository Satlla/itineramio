// Script para verificar propiedades publicadas
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkPublishedProperties() {
  try {
    console.log('🔍 Buscando propiedades publicadas...\n')
    
    // Buscar todas las propiedades
    const allProperties = await prisma.property.findMany({
      select: {
        id: true,
        name: true,
        isPublished: true,
        publishedAt: true,
        zones: {
          select: {
            id: true,
            name: true,
            isPublished: true,
            steps: {
              where: { isPublished: true },
              select: { id: true }
            }
          }
        }
      }
    })
    
    console.log(`📊 Total de propiedades: ${allProperties.length}`)
    
    // Filtrar publicadas y no publicadas
    const publishedProperties = allProperties.filter(p => p.isPublished)
    const unpublishedProperties = allProperties.filter(p => !p.isPublished)
    
    console.log(`✅ Propiedades publicadas: ${publishedProperties.length}`)
    console.log(`❌ Propiedades no publicadas: ${unpublishedProperties.length}\n`)
    
    // Mostrar detalles de propiedades publicadas
    if (publishedProperties.length > 0) {
      console.log('📋 Propiedades publicadas:')
      publishedProperties.forEach(property => {
        const publishedZones = property.zones.filter(z => z.isPublished || z.steps.length > 0)
        console.log(`\n   🏠 ${property.name}`)
        console.log(`      ID: ${property.id}`)
        console.log(`      Zonas publicadas: ${publishedZones.length}/${property.zones.length}`)
        console.log(`      Publicada el: ${property.publishedAt ? new Date(property.publishedAt).toLocaleDateString() : 'N/A'}`)
        console.log(`      URL: https://www.itineramio.com/guide/${property.id}`)
      })
    }
    
    // Mostrar IDs de propiedades no publicadas
    if (unpublishedProperties.length > 0) {
      console.log('\n\n❌ Propiedades NO publicadas:')
      unpublishedProperties.forEach(property => {
        console.log(`   - ${property.name} (ID: ${property.id})`)
      })
    }
    
    // Buscar las propiedades específicas que el usuario mencionó
    const testIds = [
      'cmcqppejj00027cbu1c9c3r6t',
      'cmcqq5nf30001lb043htv4xij',
      'cmck7fchh000cl204e2eg56xb'
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
        console.log(`\n   ID: ${testId}`)
        console.log(`   Nombre: ${property.name}`)
        console.log(`   ¿Publicada?: ${property.isPublished ? '✅ SÍ' : '❌ NO'}`)
        console.log(`   Zonas: ${property.zones.length}`)
        console.log(`   Zonas con pasos publicados: ${property.zones.filter(z => z.steps.length > 0).length}`)
      } else {
        console.log(`\n   ID: ${testId} - ❌ NO EXISTE`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPublishedProperties()