// Script rápido para publicar propiedades
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fix() {
  try {
    // Publicar las propiedades mencionadas
    const ids = [
      'cmcqppejj00027cbu1c9c3r6t',
      'cmcqq5nf30001lb043htv4xij'
    ]
    
    for (const id of ids) {
      const result = await prisma.property.update({
        where: { id },
        data: { 
          isPublished: true,
          publishedAt: new Date()
        }
      })
      console.log(`✅ Publicada: ${result.name} - ${id}`)
      
      // Publicar sus zonas
      await prisma.zone.updateMany({
        where: { propertyId: id },
        data: { 
          isPublished: true,
          publishedAt: new Date()
        }
      })
      
      // Publicar sus pasos
      await prisma.step.updateMany({
        where: { 
          zone: { propertyId: id }
        },
        data: { 
          isPublished: true,
          publishedAt: new Date()
        }
      })
    }
    
    console.log('\n✅ Listo! Las propiedades están publicadas.')
    console.log('URLs:')
    console.log('- https://www.itineramio.com/guide/cmcqppejj00027cbu1c9c3r6t')
    console.log('- https://www.itineramio.com/guide/cmcqq5nf30001lb043htv4xij')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fix()