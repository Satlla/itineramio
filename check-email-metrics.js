const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkMetrics() {
  try {
    // Total de subscribers
    const totalSubscribers = await prisma.emailSubscriber.count()

    // Subscribers activos
    const activeSubscribers = await prisma.emailSubscriber.count({
      where: { status: 'active' }
    })

    // Subscribers por arquetipo
    const byArchetype = await prisma.emailSubscriber.groupBy({
      by: ['archetype'],
      _count: true,
      where: { archetype: { not: null } }
    })

    // Emails enviados en la secuencia
    const sequenceMetrics = await prisma.emailSubscriber.aggregate({
      _count: {
        day3SentAt: true,
        day7SentAt: true,
        day10SentAt: true,
        day14SentAt: true,
      }
    })

    // Subscribers que completaron el test
    const withTest = await prisma.emailSubscriber.count({
      where: { hostProfileTestId: { not: null } }
    })

    // Conversión de test a subscriber
    const totalTests = await prisma.hostProfileTest.count()

    console.log('📊 MÉTRICAS DEL EMBUDO DE EMAIL\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📝 SUBSCRIBERS:')
    console.log(`   Total: ${totalSubscribers}`)
    console.log(`   Activos: ${activeSubscribers}`)
    console.log(`   Con test completado: ${withTest}`)
    console.log('')
    console.log('🎯 DISTRIBUCIÓN POR ARQUETIPO:')
    byArchetype.forEach(item => {
      console.log(`   ${item.archetype || 'Sin arquetipo'}: ${item._count}`)
    })
    console.log('')
    console.log('📧 EMAILS DE SECUENCIA ENVIADOS:')
    console.log(`   Día 3 (Errores comunes): ${sequenceMetrics._count.day3SentAt}`)
    console.log(`   Día 7 (Caso de estudio): ${sequenceMetrics._count.day7SentAt}`)
    console.log(`   Día 10 (Trial): ${sequenceMetrics._count.day10SentAt}`)
    console.log(`   Día 14 (Urgencia): ${sequenceMetrics._count.day14SentAt}`)
    console.log('')
    console.log('📈 CONVERSIÓN:')
    console.log(`   Tests completados: ${totalTests}`)
    console.log(`   Conversión test → subscriber: ${((withTest/totalTests)*100).toFixed(1)}%`)

    // Calcular tasa de dropout en la secuencia
    const day3Rate = activeSubscribers > 0 ? ((sequenceMetrics._count.day3SentAt / activeSubscribers) * 100).toFixed(1) : 0
    const day7Rate = sequenceMetrics._count.day3SentAt > 0 ? ((sequenceMetrics._count.day7SentAt / sequenceMetrics._count.day3SentAt) * 100).toFixed(1) : 0
    const day10Rate = sequenceMetrics._count.day7SentAt > 0 ? ((sequenceMetrics._count.day10SentAt / sequenceMetrics._count.day7SentAt) * 100).toFixed(1) : 0
    const day14Rate = sequenceMetrics._count.day10SentAt > 0 ? ((sequenceMetrics._count.day14SentAt / sequenceMetrics._count.day10SentAt) * 100).toFixed(1) : 0

    console.log('')
    console.log('📉 RETENCIÓN EN SECUENCIA:')
    console.log(`   Día 3: ${day3Rate}% de activos`)
    console.log(`   Día 7: ${day7Rate}% de quienes recibieron día 3`)
    console.log(`   Día 10: ${day10Rate}% de quienes recibieron día 7`)
    console.log(`   Día 14: ${day14Rate}% de quienes recibieron día 10`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkMetrics()
