import { prisma } from '../src/lib/prisma'

async function listProperties() {
  try {
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        city: true,
        country: true,
        host: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Found ${properties.length} properties:`)
    console.log('---')
    
    for (const property of properties) {
      console.log(`ID: ${property.id}`)
      console.log(`Name: ${property.name}`)
      console.log(`Status: ${property.status}`)
      console.log(`Location: ${property.city}, ${property.country}`)
      console.log(`Host: ${property.host.name} (${property.host.email})`)
      console.log('---')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listProperties()