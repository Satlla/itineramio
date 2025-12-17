const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verificando tracking de WhatsApp...\n')

  // 1. Verificar PropertyAnalytics con whatsappClicks > 0
  const analyticsWithClicks = await prisma.propertyAnalytics.findMany({
    where: {
      whatsappClicks: { gt: 0 }
    },
    select: {
      propertyId: true,
      whatsappClicks: true,
      totalViews: true,
      lastViewedAt: true
    }
  })
  
  console.log('📊 PropertyAnalytics con WhatsApp clicks:')
  console.log(analyticsWithClicks.length > 0 ? analyticsWithClicks : '  (ninguno encontrado)')
  console.log('')

  // 2. Verificar TrackingEvents de tipo WHATSAPP_CLICK
  const whatsappEvents = await prisma.trackingEvent.findMany({
    where: {
      type: 'WHATSAPP_CLICK'
    },
    orderBy: {
      timestamp: 'desc'
    },
    take: 10
  })
  
  console.log('📱 TrackingEvents de WHATSAPP_CLICK (últimos 10):')
  console.log(whatsappEvents.length > 0 ? whatsappEvents : '  (ninguno encontrado)')
  console.log('')

  // 3. Verificar DailyStats con whatsappClicks > 0
  const dailyWithClicks = await prisma.dailyStats.findMany({
    where: {
      whatsappClicks: { gt: 0 }
    },
    orderBy: {
      date: 'desc'
    },
    take: 10
  })
  
  console.log('📅 DailyStats con WhatsApp clicks (últimos 10):')
  console.log(dailyWithClicks.length > 0 ? dailyWithClicks : '  (ninguno encontrado)')
  console.log('')

  // 4. Verificar últimos TrackingEvents de cualquier tipo
  const recentEvents = await prisma.trackingEvent.findMany({
    orderBy: {
      timestamp: 'desc'
    },
    take: 5,
    select: {
      type: true,
      propertyId: true,
      timestamp: true,
      ipAddress: true
    }
  })
  
  console.log('🕐 Últimos 5 TrackingEvents (cualquier tipo):')
  console.log(recentEvents)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
