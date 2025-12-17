const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verificando esquema de tracking...\n')

  // Verificar si la tabla tracking_events existe
  try {
    const count = await prisma.trackingEvent.count()
    console.log('✅ Tabla tracking_events existe. Registros:', count)
  } catch (error) {
    console.log('❌ Error con tracking_events:', error.message)
  }

  // Verificar PropertyAnalytics
  try {
    const analytics = await prisma.propertyAnalytics.findMany({
      take: 3,
      select: {
        propertyId: true,
        totalViews: true,
        uniqueVisitors: true,
        whatsappClicks: true,
        zoneViews: true
      }
    })
    console.log('\n📊 Ejemplo de PropertyAnalytics:')
    console.log(analytics)
  } catch (error) {
    console.log('❌ Error con PropertyAnalytics:', error.message)
  }

  // Verificar ZoneViews
  try {
    const zoneViews = await prisma.zoneView.count()
    console.log('\n📍 Total ZoneViews:', zoneViews)
  } catch (error) {
    console.log('❌ Error con ZoneView:', error.message)
  }

  // Verificar PropertyViews
  try {
    const propertyViews = await prisma.propertyView.count()
    console.log('🏠 Total PropertyViews:', propertyViews)
  } catch (error) {
    console.log('❌ Error con PropertyView:', error.message)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
