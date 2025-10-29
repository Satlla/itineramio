const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkTrial() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'alejandrosatlla@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        trialStartedAt: true,
        trialEndsAt: true
      }
    })

    if (!user) {
      console.log('❌ Usuario no encontrado')
      return
    }

    console.log('✅ Usuario encontrado:')
    console.log('ID:', user.id)
    console.log('Nombre:', user.name)
    console.log('Email:', user.email)
    console.log('Trial iniciado:', user.trialStartedAt)
    console.log('Trial termina:', user.trialEndsAt)

    if (!user.trialStartedAt || !user.trialEndsAt) {
      console.log('\n❌ El usuario NO tiene trial configurado')
      console.log('Necesitas activar el trial para ver la cuenta atrás')
    } else {
      const now = new Date()
      const endsAt = new Date(user.trialEndsAt)
      const daysRemaining = Math.ceil((endsAt - now) / (1000 * 60 * 60 * 24))
      console.log('\n✅ Trial configurado:')
      console.log('Días restantes:', daysRemaining)
      console.log('¿Expirado?:', now > endsAt ? 'SÍ' : 'NO')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkTrial()
