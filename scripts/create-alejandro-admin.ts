import { prisma } from '../src/lib/prisma'
import { hashAdminPassword } from '../src/lib/admin-auth'

async function createAlejandroAdmin() {
  try {
    const email = 'alejandrosatlla@gmail.com'
    const password = 'Bolero1492*'
    const name = 'Alejandro Satlla'
    
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    })
    
    if (existingAdmin) {
      console.log('Admin already exists, updating password...')
      
      // Update password
      const hashedPassword = await hashAdminPassword(password)
      const updatedAdmin = await prisma.admin.update({
        where: { email },
        data: { 
          password: hashedPassword,
          name,
          isActive: true
        }
      })
      
      console.log('✅ Admin password updated successfully!')
      return
    }
    
    // Hash password
    const hashedPassword = await hashAdminPassword(password)
    
    // Create new admin
    const admin = await prisma.admin.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true
      }
    })
    
    console.log('✅ Admin created successfully!')
    console.log('📧 Email:', admin.email)
    console.log('👤 Name:', admin.name)
    console.log('🛡️ Role:', admin.role)
    
  } catch (error) {
    console.error('❌ Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAlejandroAdmin()