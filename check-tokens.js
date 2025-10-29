const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkTokens() {
  try {
    // Buscar todos los tokens de verificación para ese email
    const tokens = await prisma.emailVerificationToken.findMany({
      where: { email: 'colaboracionesbnb@gmail.com' },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`\n📧 Tokens de verificación para colaboracionesbnb@gmail.com:`)
    console.log(`   Total encontrados: ${tokens.length}\n`)
    
    if (tokens.length === 0) {
      console.log('❌ No hay tokens. Necesitas registrarte de nuevo.')
    } else {
      tokens.forEach((token, index) => {
        const isExpired = token.expires < new Date()
        const status = isExpired ? '❌ EXPIRADO' : '✅ VÁLIDO'
        
        console.log(`Token #${index + 1}:`)
        console.log(`   Status: ${status}`)
        console.log(`   Token: ${token.token.substring(0, 20)}...`)
        console.log(`   Creado: ${token.createdAt.toLocaleString()}`)
        console.log(`   Expira: ${token.expires.toLocaleString()}`)
        console.log(`   URL: http://localhost:3000/api/auth/verify-email?token=${token.token}`)
        console.log('')
      })
    }
    
    // Verificar usuario
    const user = await prisma.user.findUnique({
      where: { email: 'colaboracionesbnb@gmail.com' },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        emailVerified: true,
        status: true 
      }
    })
    
    if (user) {
      console.log(`\n👤 Estado del usuario:`)
      console.log(`   Nombre: ${user.name}`)
      console.log(`   Email verificado: ${user.emailVerified ? '✅ SÍ' : '❌ NO'}`)
      console.log(`   Status: ${user.status}`)
      
      if (!user.emailVerified && tokens.length > 0 && !tokens[0].expires < new Date()) {
        console.log(`\n✨ Usa el enlace de arriba para verificar tu email`)
      }
    } else {
      console.log('\n❌ Usuario no encontrado')
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkTokens()
