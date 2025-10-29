const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkMyTrial() {
  try {
    // Buscar el usuario admin (alejandrosatlla@gmail.com)
    const user = await prisma.user.findUnique({
      where: { email: 'alejandrosatlla@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        trialStartedAt: true,
        trialEndsAt: true,
        subscription: true,
        createdAt: true
      }
    })

    if (!user) {
      console.log('❌ Usuario no encontrado')
      return
    }

    console.log('\n📊 Datos del usuario:')
    console.log('ID:', user.id)
    console.log('Email:', user.email)
    console.log('Nombre:', user.name)
    console.log('Creado:', user.createdAt)
    console.log('\n🔍 Datos del Trial:')
    console.log('Trial Started At:', user.trialStartedAt)
    console.log('Trial Ends At:', user.trialEndsAt)
    console.log('Subscription:', user.subscription)

    if (user.trialEndsAt) {
      const now = new Date()
      const daysRemaining = Math.ceil((user.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      console.log('\n⏰ Días restantes:', daysRemaining)
      console.log('¿Trial activo?:', user.trialEndsAt > now ? '✅ SÍ' : '❌ NO (expirado)')
    } else {
      console.log('\n⚠️  NO HAY FECHAS DE TRIAL CONFIGURADAS')
      console.log('El banner NO aparecerá porque trialEndsAt es NULL')
    }

    // Verificar suscripciones
    const subscriptions = await prisma.userSubscription.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        status: true,
        startDate: true,
        endDate: true,
        plan: {
          select: {
            name: true,
            code: true
          }
        }
      }
    })

    console.log('\n💳 Suscripciones activas:', subscriptions.length)
    if (subscriptions.length > 0) {
      subscriptions.forEach(sub => {
        console.log(`  - ${sub.plan?.name || 'Sin plan'} (${sub.status})`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkMyTrial()
