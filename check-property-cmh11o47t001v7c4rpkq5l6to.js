const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkProperty() {
  const propertyId = 'cmh11o47t001v7c4rpkq5l6to'
  
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
    console.log('Property not found')
    await prisma.$disconnect()
    return
  }

  console.log('Property:', property.name)
  console.log('Status:', property.status)
  console.log('isPublished:', property.isPublished)
  console.log('Zones count:', property.zones.length)
  
  const zonesWithSteps = property.zones.filter(z => z.steps.length > 0)
  console.log('Zones with steps:', zonesWithSteps.length)
  
  if (zonesWithSteps.length === 0) {
    console.log('WOULD SHOW: Manual en preparacion')
  }
  
  if (property.status !== 'ACTIVE' || !property.isPublished) {
    console.log('WARNING: Property NOT published')
    console.log('  status:', property.status)
    console.log('  isPublished:', property.isPublished)
  }

  await prisma.$disconnect()
}

checkProperty()
