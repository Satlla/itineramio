import { prisma } from '../src/lib/prisma'

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking admin users...')
    
    const adminUsers = await prisma.user.findMany({
      where: { isAdmin: true },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true
      }
    })

    console.log(`Found ${adminUsers.length} admin users:`)
    for (const user of adminUsers) {
      console.log(`- ${user.id}: ${user.name} (${user.email})`)
    }

    if (adminUsers.length === 0) {
      console.log('\n❌ No admin users found!')
      console.log('Creating a demo admin user...')
      
      const demoAdmin = await prisma.user.create({
        data: {
          email: 'admin@itineramio.com',
          name: 'Demo Admin',
          isAdmin: true,
          emailVerified: new Date()
        }
      })
      
      console.log('✅ Created demo admin:', demoAdmin.id)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminUsers()