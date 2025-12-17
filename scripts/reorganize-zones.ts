import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Desired zone order as specified by user
const desiredOrder = [
  'Check in',
  'Check In',
  'Cómo Llegar',
  'Como llegar',
  'Normas',
  'Normas de la Casa',
  'Check Out',
  'Checkout',
  'WiFi',
  'Wifi',
  'Wi-Fi',
  'Parking',
  'Tour',
  'Climatización',
  'Climatizacion'
]

async function main() {
  console.log('🔄 REORGANIZANDO ZONAS para alejandrosatlla@gmail.com\n')
  console.log('=' .repeat(80))

  // Find user
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

  // Get all properties
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

  let totalZonesUpdated = 0
  let totalPropertiesProcessed = 0

  for (const property of properties) {
    console.log(`\n🏠 PROPIEDAD: ${property.name}`)
    const direccion = [property.street, property.city].filter(Boolean).join(', ') || 'Sin dirección'
    console.log(`   Dirección: ${direccion}`)
    console.log(`   ID: ${property.id}`)
    console.log('   ' + '-'.repeat(76))

    // Get zones using raw SQL to see the Json name field
    const zones = await prisma.$queryRaw<Array<{
      id: string
      name: any
      order: number | null
      createdAt: Date
    }>>`
      SELECT id, name, "order", "createdAt"
      FROM zones
      WHERE "propertyId" = ${property.id}
      ORDER BY "createdAt" ASC
    `

    if (zones.length === 0) {
      console.log('   ⚠️  Sin zonas')
      continue
    }

    console.log(`   📋 Zonas actuales (${zones.length} total):\n`)

    // Extract zone name strings from Json
    const zonesWithNames = zones.map(zone => {
      let zoneName = 'Unknown'
      if (typeof zone.name === 'object' && zone.name !== null) {
        zoneName = zone.name.es || zone.name.en || Object.values(zone.name)[0] || JSON.stringify(zone.name)
      } else if (typeof zone.name === 'string') {
        zoneName = zone.name
      }

      return {
        ...zone,
        extractedName: zoneName
      }
    })

    // Sort zones by desired order
    const sortedZones = zonesWithNames.map(zone => {
      // Find position in desired order (case insensitive match)
      const position = desiredOrder.findIndex(desiredName =>
        desiredName.toLowerCase() === zone.extractedName.toLowerCase()
      )

      return {
        ...zone,
        newOrder: position >= 0 ? position + 1 : 999 + zones.indexOf(zone) // Start from 1, unknowns at end
      }
    }).sort((a, b) => a.newOrder - b.newOrder)

    // Display old vs new order
    zones.forEach((zone, index) => {
      const zoneName = zonesWithNames.find(z => z.id === zone.id)?.extractedName || 'Unknown'
      const oldOrder = zone.order !== null ? zone.order : 'NULL'
      const newZone = sortedZones.find(z => z.id === zone.id)
      const newOrder = newZone?.newOrder || '???'

      console.log(`   ${index + 1}. ${zoneName.padEnd(30)} | Viejo: ${String(oldOrder).padEnd(6)} → Nuevo: ${newOrder}`)
    })

    // Update zones in database
    console.log(`\n   🔄 Actualizando ${zones.length} zonas...`)

    try {
      const updatePromises = sortedZones.map((zone) =>
        prisma.zone.update({
          where: { id: zone.id },
          data: { order: zone.newOrder }
        })
      )

      await prisma.$transaction(updatePromises)

      console.log(`   ✅ ${zones.length} zonas actualizadas correctamente`)
      totalZonesUpdated += zones.length
      totalPropertiesProcessed++
    } catch (error) {
      console.error(`   ❌ Error actualizando zonas:`, error)
    }
  }

  console.log('\n' + '=' .repeat(80))
  console.log('\n✅ REORGANIZACIÓN COMPLETA:')
  console.log('=' .repeat(80))
  console.log(`Propiedades procesadas: ${totalPropertiesProcessed}/${properties.length}`)
  console.log(`Zonas actualizadas: ${totalZonesUpdated}`)

  console.log('\n📋 Orden final aplicado:')
  desiredOrder.forEach((name, index) => {
    console.log(`   ${index + 1}. ${name}`)
  })
  console.log(`   ${desiredOrder.length + 1}+. [Resto de zonas]`)

  await prisma.$disconnect()
}

main()
