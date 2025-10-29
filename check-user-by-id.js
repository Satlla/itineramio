const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUser() {
  try {
    const userId = 'cmgy660l100047c2pj4m58uup' // Del log del servidor

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      console.log('❌ Usuario no encontrado con ID:', userId)
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

    if (!user.trialStartedAt && !user.trialEndsAt) {
      console.log('\n⚠️  PROBLEMA ENCONTRADO: NO HAY FECHAS DE TRIAL')
      console.log('El banner NO puede aparecer porque trialStartedAt y trialEndsAt son NULL')
      console.log('\n💡 SOLUCIÓN: Necesitamos crear el trial de 15 días')

      const trialStart = new Date()
      const trialEnd = new Date()
      trialEnd.setDate(trialEnd.getDate() + 15)

      console.log('\nEjecutar este SQL para arreglar:')
      console.log(`UPDATE users SET "trialStartedAt" = '${trialStart.toISOString()}', "trialEndsAt" = '${trialEnd.toISOString()}' WHERE id = '${userId}';`)
    } else if (user.trialEndsAt) {
      const now = new Date()
      const daysRemaining = Math.ceil((user.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      console.log('\n⏰ Días restantes:', daysRemaining)
      console.log('¿Trial activo?:', user.trialEndsAt > now ? '✅ SÍ' : '❌ NO (expirado)')
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

    console.log('\n💳 Suscripciones:', subscriptions.length)
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

checkUser()
