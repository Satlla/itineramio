import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 DIAGNÓSTICO: Orden de Zonas\n')
  console.log('=' .repeat(80))

  // Buscar usuario alejandrosatlla@gmail.com
  const user = await prisma.user.findUnique({
    where: { email: 'alejandrosatlla@gmail.com' },
    select: { id: true, email: true, name: true }
  })

  if (!user) {
    console.log('❌ Usuario no encontrado')
    return
  }

  console.log(`\n✅ Usuario encontrado: ${user.name} (${user.email})`)
  console.log(`   ID: ${user.id}`)

  // Obtener todas las propiedades del usuario
  const properties = await prisma.property.findMany({
    where: { hostId: user.id },
    select: {
      id: true,
      name: true,
      street: true,
      city: true
    },
    orderBy: { createdAt: 'asc' }
  })

  console.log(`\n📦 Propiedades encontradas: ${properties.length}`)
  console.log('=' .repeat(80))

  for (const property of properties) {
    console.log(`\n🏠 PROPIEDAD: ${property.name}`)
    const direccion = [property.street, property.city].filter(Boolean).join(', ') || 'Sin dirección'
    console.log(`   Dirección: ${direccion}`)
    console.log(`   ID: ${property.id}`)
    console.log('   ' + '-'.repeat(76))

    // Obtener zonas de esta propiedad usando raw SQL para ver el campo order
    const zones = await prisma.$queryRaw<Array<{
      id: string
      name: any
      order: number | null
      createdAt: Date
    }>>`
      SELECT id, name, "order", "createdAt"
      FROM zones
      WHERE "propertyId" = ${property.id}
      ORDER BY COALESCE("order", 999999) ASC, id ASC
    `

    if (zones.length === 0) {
      console.log('   ⚠️  Sin zonas creadas')
      continue
    }

    console.log(`   📋 Zonas (${zones.length} total):`)
    console.log('')

    zones.forEach((zone, index) => {
      // Handle Json type for name - extract string representation
      let zoneName = 'Unknown'
      if (typeof zone.name === 'object' && zone.name !== null) {
        // Try to get Spanish locale, fallback to first value or JSON string
        zoneName = zone.name.es || zone.name.en || Object.values(zone.name)[0] || JSON.stringify(zone.name)
      } else if (typeof zone.name === 'string') {
        zoneName = zone.name
      }

      const orderValue = zone.order !== null ? zone.order : 'NULL'
      const orderDisplay = zone.order !== null ? `✓ ${zone.order}` : '✗ NULL'
      console.log(`   ${index + 1}. ${zoneName.substring(0, 25).padEnd(25)} | Order: ${String(orderDisplay).padEnd(10)} | ID: ${zone.id.substring(0, 8)}...`)
    })

    // Verificar si hay zonas sin orden definido
    const zonesWithoutOrder = zones.filter(z => z.order === null)
    if (zonesWithoutOrder.length > 0) {
      console.log(`\n   ⚠️  PROBLEMA: ${zonesWithoutOrder.length} zonas sin valor de 'order'`)
      console.log('   ⚠️  Estas zonas se ordenarán por ID en lugar de por orden definido')
    } else {
      console.log(`\n   ✅ Todas las zonas tienen valor de 'order' definido`)
    }

    // Verificar si hay órdenes duplicados
    const orderCounts = new Map<number, number>()
    zones.forEach(z => {
      if (z.order !== null) {
        orderCounts.set(z.order, (orderCounts.get(z.order) || 0) + 1)
      }
    })
    const duplicates = Array.from(orderCounts.entries()).filter(([_, count]) => count > 1)
    if (duplicates.length > 0) {
      console.log(`\n   ⚠️  ADVERTENCIA: Valores de 'order' duplicados encontrados:`)
      duplicates.forEach(([order, count]) => {
        console.log(`      - Order ${order}: ${count} zonas`)
      })
    }
  }

  console.log('\n' + '=' .repeat(80))
  console.log('\n🔍 RESUMEN DEL DIAGNÓSTICO:')
  console.log('=' .repeat(80))
  console.log(`Total de propiedades: ${properties.length}`)

  // Contar total de zonas
  const totalZones = await prisma.zone.count({
    where: {
      property: {
        hostId: user.id
      }
    }
  })

  const zonesWithOrder = await prisma.zone.count({
    where: {
      property: {
        hostId: user.id
      },
      order: {
        not: null
      }
    }
  })

  const zonesWithoutOrder = totalZones - zonesWithOrder

  console.log(`Total de zonas: ${totalZones}`)
  console.log(`Zonas con 'order' definido: ${zonesWithOrder}`)
  console.log(`Zonas SIN 'order' definido: ${zonesWithoutOrder}`)

  if (zonesWithoutOrder > 0) {
    console.log(`\n❌ PROBLEMA DETECTADO:`)
    console.log(`   ${zonesWithoutOrder} zonas no tienen valor de 'order' en la base de datos`)
    console.log(`   Estas zonas se ordenarán incorrectamente por ID en lugar de por orden`)
    console.log(`\n💡 SOLUCIÓN:`)
    console.log(`   Ejecutar script de reorganización para asignar orden correcto`)
  } else {
    console.log(`\n✅ Todas las zonas tienen campo 'order' correctamente configurado`)
  }

  await prisma.$disconnect()
}

main()
