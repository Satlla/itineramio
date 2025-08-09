import { prisma } from '../src/lib/prisma'
import { hashAdminPassword } from '../src/lib/admin-auth'

async function createAdmin() {
  try {
    const email = 'admin@itineramio.com'
    const password = 'Admin2024!' // Cambia esto por una contraseña segura
    const name = 'Administrador Principal'
    
    // Hash the password
    const hashedPassword = await hashAdminPassword(password)
    
    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true
      }
    })
    
    console.log('✅ Admin created successfully:', {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    })
    
    console.log('\n📧 Login credentials:')
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log('\n⚠️  Please change the password after first login!')
    
  } catch (error) {
    console.error('❌ Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()