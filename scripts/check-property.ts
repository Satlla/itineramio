import { prisma } from '../src/lib/prisma'

async function checkProperty() {
  try {
    const propertyId = 'prop-1754480207779-7gwejz'
    
    console.log('Checking property:', propertyId)
    
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            isAdmin: true
          }
        }
      }
    })

    if (!property) {
      console.log('❌ Property not found')
      return
    }

    console.log('✅ Property found:')
    console.log('- ID:', property.id)
    console.log('- Name:', property.name)
    console.log('- Status:', property.status)
    console.log('- Host ID:', property.hostId)
    console.log('- Host Name:', property.host.name)
    console.log('- Host Email:', property.host.email)
    console.log('- Is Admin:', property.host.isAdmin)
    console.log('- Subscription Ends At:', property.subscriptionEndsAt)
    console.log('- Published:', property.isPublished)
    console.log('- Published At:', property.publishedAt)
    
    // Check if we can create a notification for this user
    console.log('\nChecking notification creation...')
    try {
      const testNotification = await prisma.notification.create({
        data: {
          userId: property.hostId,
          type: 'TEST',
          title: 'Test notification',
          message: 'This is a test notification to verify the user relationship works',
          data: { test: true }
        }
      })
      console.log('✅ Notification created successfully:', testNotification.id)
      
      // Clean up
      await prisma.notification.delete({
        where: { id: testNotification.id }
      })
      console.log('✅ Test notification cleaned up')
    } catch (notifError) {
      console.error('❌ Error creating notification:', notifError)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProperty()