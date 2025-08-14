import { prisma } from '../src/lib/prisma'

async function checkProperty() {
  try {
    const propertyId = 'cmd78c4sc0001ji043s1vx8c2'
    
    console.log('Checking property:', propertyId)
    
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            isAdmin: true
          }
        }
      }
    })

    if (!property) {
      console.log('❌ Property not found')
      
      // Let's see what properties DO exist
      console.log('\nActual properties in database:')
      const allProperties = await prisma.property.findMany({
        select: {
          id: true,
          name: true,
          status: true,
          host: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
      
      for (const prop of allProperties) {
        console.log(`- ${prop.id}: ${prop.name} (${prop.status}) - ${prop.host.name}`)
      }
      
      return
    }

    console.log('✅ Property found:')
    console.log('- ID:', property.id)
    console.log('- Name:', property.name)
    console.log('- Status:', property.status)
    console.log('- Host:', property.host.name, '(' + property.host.email + ')')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProperty()