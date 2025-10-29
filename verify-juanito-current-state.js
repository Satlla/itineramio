const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verify() {
  try {
    const sub = await prisma.userSubscription.findFirst({
      where: {
        userId: 'cmh9csfkk000o7coq4x91opn8',
        status: 'ACTIVE'
      },
      include: { plan: true }
    })
    
    if (!sub) {
      console.log('No active subscription found')
      return
    }
    
    const now = new Date()
    const duration = sub.endDate.getTime() - sub.startDate.getTime()
    const days = Math.round(duration / (1000 * 60 * 60 * 24))
    const remaining = sub.endDate.getTime() - now.getTime()
    const daysRemaining = Math.round(remaining / (1000 * 60 * 60 * 24))
    
    console.log('\n🔍 ESTADO ACTUAL DE LA SUSCRIPCIÓN\n')
    console.log('Plan:', sub.plan.code, '-', sub.plan.name)
    console.log('Start Date:', sub.startDate.toISOString())
    console.log('End Date:', sub.endDate.toISOString())
    console.log('Duración total:', days, 'días')
    console.log('Días restantes:', daysRemaining)
    console.log('\nBilling period esperado:', days >= 150 && days <= 210 ? 'SEMESTRAL (6 meses)' : days >= 300 ? 'ANUAL' : 'MENSUAL')
    console.log('\nFecha End legible:', sub.endDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }))
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verify()
