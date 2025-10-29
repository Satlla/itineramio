const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixSubscriptionEndDate() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'colaboracionesbnb@gmail.com' }
    })

    const subscription = await prisma.userSubscription.findFirst({
      where: { userId: user.id, status: 'ACTIVE' }
    })

    console.log('📋 BEFORE:')
    console.log('  Start Date:', subscription.startDate)
    console.log('  End Date:', subscription.endDate)

    // Calcular nueva fecha de fin: start + 6 meses
    const newEndDate = new Date(subscription.startDate)
    newEndDate.setMonth(newEndDate.getMonth() + 6)

    console.log('\n📋 AFTER (should be):')
    console.log('  Start Date:', subscription.startDate)
    console.log('  End Date:', newEndDate)
    console.log('  Months:', 6)
    console.log('  Billing Period: BIANNUAL (Semestral)')

    // Actualizar
    await prisma.userSubscription.update({
      where: { id: subscription.id },
      data: {
        endDate: newEndDate,
        notes: 'HOST Semestral (6 meses) - €102.60 - Corregido período de facturación'
      }
    })

    console.log('\n✅ Suscripción actualizada correctamente!')
    console.log('   Nueva fecha de vencimiento:', newEndDate.toLocaleDateString('es-ES'))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSubscriptionEndDate()
