import { prisma } from '../src/lib/prisma'

function generatePropertyCode(): string {
  // Genera código tipo ITN-247856
  const prefix = 'ITN'
  const number = Math.floor(100000 + Math.random() * 900000)
  return `${prefix}-${number}`
}

async function generateCodesForExistingProperties() {
  try {
    // Obtener todas las propiedades sin código
    const propertiesWithoutCode = await prisma.property.findMany({
      where: {
        propertyCode: null
      },
      select: {
        id: true,
        name: true
      }
    })

    console.log(`Encontradas ${propertiesWithoutCode.length} propiedades sin código`)

    for (const property of propertiesWithoutCode) {
      let code = generatePropertyCode()
      let isUnique = false
      let attempts = 0

      // Asegurar que el código es único
      while (!isUnique && attempts < 10) {
        const existing = await prisma.property.findUnique({
          where: { propertyCode: code }
        })
        
        if (!existing) {
          isUnique = true
        } else {
          code = generatePropertyCode()
          attempts++
        }
      }

      if (isUnique) {
        await prisma.property.update({
          where: { id: property.id },
          data: { propertyCode: code }
        })
        
        console.log(`✅ ${property.name}: ${code}`)
      } else {
        console.error(`❌ No se pudo generar código único para ${property.name}`)
      }
    }

    console.log('🎉 ¡Códigos generados exitosamente!')

  } catch (error) {
    console.error('❌ Error generando códigos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

generateCodesForExistingProperties()