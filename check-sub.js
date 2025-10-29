const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkSubscription() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'alejandrosatlla@gmail.com' },
      select: { id: true }
    })

    if (!user) {
      console.log('Usuario no encontrado')
      return
    }

    const activeSubscriptions = await prisma.userSubscription.findMany({
      where: {
        userId: user.id,
        status: 'ACTIVE'
      },
      include: {
        plan: {
          select: {
            name: true,
            code: true
          }
        }
      }
    })

    console.log('Usuario:', user.id)
    console.log('Suscripciones activas:', activeSubscriptions.length)
    
    if (activeSubscriptions.length > 0) {
      console.log('\nTIENES SUSCRIPCIONES ACTIVAS - Esto oculta el Hello Bar!')
      activeSubscriptions.forEach((sub) => {
        console.log('\nPlan:', sub.plan?.name || 'Custom')
        console.log('Status:', sub.status)
        console.log('Inicio:', sub.startDate)
        console.log('Fin:', sub.endDate)
      })
    } else {
      console.log('\nNo tienes suscripciones activas')
      console.log('El Hello Bar deberia aparecer con la cuenta atras')
    }
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkSubscription()
