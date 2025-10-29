const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUserNotifications() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'colaboracionesbnb@gmail.com' }
    })

    if (!user) {
      console.log('❌ Usuario no encontrado')
      return
    }

    console.log('📬 Verificando notificaciones del usuario...\n')

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    console.log(`✅ Notificaciones encontradas: ${notifications.length}\n`)

    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title}`)
      console.log(`   Tipo: ${notif.type}`)
      console.log(`   Mensaje: ${notif.message}`)
      console.log(`   Leída: ${notif.read}`)
      console.log(`   Creada: ${notif.createdAt}`)
      console.log(`   Data:`, JSON.stringify(notif.data, null, 2))
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserNotifications()
