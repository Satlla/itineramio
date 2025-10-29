const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function deleteUser() {
  try {
    console.log('🗑️ Eliminando usuario colaboracionesbnb@gmail.com...')
    
    // Primero eliminar tokens de verificación
    await prisma.emailVerificationToken.deleteMany({
      where: { email: 'colaboracionesbnb@gmail.com' }
    })
    console.log('✅ Tokens eliminados')
    
    // Eliminar usuario (cascade eliminará relaciones)
    const deleted = await prisma.user.delete({
      where: { email: 'colaboracionesbnb@gmail.com' }
    })
    
    console.log('✅ Usuario eliminado exitosamente:')
    console.log(`   - ID: ${deleted.id}`)
    console.log(`   - Nombre: ${deleted.name}`)
    console.log(`   - Email: ${deleted.email}`)
    console.log('\n✨ Ahora puedes registrarte con este email de nuevo')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

deleteUser()
