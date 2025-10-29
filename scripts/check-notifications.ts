import { prisma } from '../src/lib/prisma'

async function checkNotifications() {
  try {
    console.log('🔍 Checking recent notifications...')
    
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log(`📱 Found ${notifications.length} recent notifications:`)
    console.log('---')
    
    for (const notification of notifications) {
      console.log(`📢 ${notification.title}`)
      console.log(`   To: ${notification.user.name} (${notification.user.email})`)
      console.log(`   Type: ${notification.type}`)
      console.log(`   Read: ${notification.read ? '✅' : '❌'}`)
      console.log(`   Created: ${notification.createdAt.toLocaleString()}`)
      console.log(`   Message: ${notification.message}`)
      if (notification.data) {
        console.log(`   Data: ${JSON.stringify(notification.data)}`)
      }
      console.log('---')
    }

    // Check admin activity logs too
    console.log('\n📝 Checking admin activity logs...')
    const adminLogs = await prisma.adminActivityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        admin: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    for (const log of adminLogs) {
      console.log(`🔧 ${log.action}: ${log.description}`)
      console.log(`   By: ${log.admin.name} (${log.admin.email})`)
      console.log(`   When: ${log.createdAt.toLocaleString()}`)
      console.log('---')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkNotifications()