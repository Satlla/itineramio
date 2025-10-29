import { prisma } from '../src/lib/prisma'

async function checkUserProperties() {
  try {
    // Buscar tu usuario por email
    const user = await prisma.user.findUnique({
      where: { email: 'alejandrosatlla@gmail.com' }
    })
    
    if (!user) {
      console.log('Usuario no encontrado')
      return
    }
    
    console.log('Usuario encontrado:', user.id, user.name)
    
    // Contar propiedades totales
    const totalProperties = await prisma.property.count({
      where: { hostId: user.id }
    })
    
    console.log(`\nTotal de propiedades: ${totalProperties}`)
    
    // Obtener lista de propiedades
    const properties = await prisma.property.findMany({
      where: { hostId: user.id },
      select: {
        id: true,
        name: true,
        status: true,
        propertySetId: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('\nPropiedades:')
    properties.forEach((prop, index) => {
      console.log(`${index + 1}. ${prop.name} (${prop.status}) - ${prop.propertySetId ? 'En conjunto' : 'Individual'}`)
    })
    
    // Contar property sets
    const propertySets = await prisma.propertySet.count({
      where: { hostId: user.id }
    })
    
    console.log(`\nTotal de conjuntos: ${propertySets}`)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserProperties()