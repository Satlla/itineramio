import { prisma } from '../src/lib/prisma'

async function debugPropertiesCount() {
  try {
    // Buscar tu usuario por email
    const user = await prisma.user.findUnique({
      where: { email: 'alejandrosatlla@gmail.com' }
    })
    
    if (!user) {
      console.log('Usuario no encontrado')
      return
    }
    
    console.log('=== ANÁLISIS DE PROPIEDADES ===')
    console.log('Usuario:', user.name, '(' + user.id + ')')
    console.log('')
    
    // Obtener TODAS las propiedades
    const allProperties = await prisma.property.findMany({
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
    
    // Separar propiedades individuales y en conjuntos
    const individualProperties = allProperties.filter(p => !p.propertySetId)
    const propertiesInSets = allProperties.filter(p => p.propertySetId)
    
    console.log(`Total de propiedades: ${allProperties.length}`)
    console.log(`Propiedades individuales: ${individualProperties.length}`)
    console.log(`Propiedades en conjuntos: ${propertiesInSets.length}`)
    console.log('')
    
    // Mostrar propiedades individuales
    console.log('=== PROPIEDADES INDIVIDUALES ===')
    individualProperties.forEach((prop, index) => {
      console.log(`${index + 1}. ${prop.name} (${prop.status}) - ID: ${prop.id}`)
    })
    console.log('')
    
    // Verificar qué devolvería el endpoint dashboard/data
    console.log('=== SIMULACIÓN ENDPOINT DASHBOARD/DATA ===')
    
    // Simular la consulta del endpoint (primeras 10)
    const dashboardProperties = await prisma.property.findMany({
      where: { hostId: user.id },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        status: true,
        propertySetId: true
      }
    })
    
    console.log(`Endpoint obtendría ${dashboardProperties.length} propiedades`)
    console.log('Primeras 3 que se mostrarían:')
    dashboardProperties.slice(0, 3).forEach((prop, index) => {
      console.log(`${index + 1}. ${prop.name} - ${prop.propertySetId ? 'En conjunto' : 'Individual'}`)
    })
    
    // Verificar conteo total
    const totalCount = await prisma.property.count({
      where: { hostId: user.id }
    })
    console.log(`\nConteo total desde count(): ${totalCount}`)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugPropertiesCount()