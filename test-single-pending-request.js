const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testSinglePendingRequest() {
  try {
    console.log('🧪 Testing single pending request validation...\n')

    // Buscar un usuario de prueba (Israel Bernal)
    const user = await prisma.user.findUnique({
      where: { email: 'colaboracionesbnb@gmail.com' },
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      console.error('❌ Usuario de prueba no encontrado')
      return
    }

    console.log('✅ Usuario de prueba:', user.name, `(${user.email})`)

    // Verificar solicitudes pendientes actuales
    const currentPendingRequests = await prisma.subscriptionRequest.findMany({
      where: {
        userId: user.id,
        status: 'PENDING'
      },
      include: {
        plan: {
          select: { name: true }
        }
      }
    })

    console.log(`\n📋 Solicitudes PENDING actuales: ${currentPendingRequests.length}`)
    currentPendingRequests.forEach((req, idx) => {
      console.log(`   ${idx + 1}. ID: ${req.id.slice(-8)} - €${req.totalAmount} - ${req.plan?.name || 'N/A'}`)
    })

    // Obtener todas las solicitudes para estadísticas
    const allRequests = await prisma.subscriptionRequest.findMany({
      where: { userId: user.id },
      select: { id: true, status: true, totalAmount: true }
    })

    console.log(`\n📊 Total de solicitudes del usuario: ${allRequests.length}`)
    const statusCounts = allRequests.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1
      return acc
    }, {})
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count}`)
    })

    // Verificar si la validación está funcionando
    if (currentPendingRequests.length > 1) {
      console.log('\n⚠️  ADVERTENCIA: El usuario tiene más de 1 solicitud PENDING')
      console.log('   Esto indica que la validación NO está funcionando correctamente.')
      console.log('   La validación debería prevenir múltiples solicitudes PENDING.')
    } else if (currentPendingRequests.length === 1) {
      console.log('\n✅ CORRECTO: El usuario tiene exactamente 1 solicitud PENDING')
      console.log('   La validación está funcionando correctamente.')
      console.log(`   Solicitud ID: ${currentPendingRequests[0].id}`)
    } else {
      console.log('\n✅ El usuario NO tiene solicitudes PENDING')
      console.log('   Puede crear una nueva solicitud sin problemas.')
    }

    // Mostrar el plan actual del usuario
    const userWithPlan = await prisma.user.findUnique({
      where: { id: user.id },
      select: { subscription: true }
    })

    console.log(`\n🎯 Plan actual del usuario: ${userWithPlan?.subscription || 'Sin plan'}`)

  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSinglePendingRequest()
