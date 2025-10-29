const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkRequest() {
  try {
    const requestId = 'cmhacpx11000r7cdzo0287yyi'

    console.log('🔍 Buscando subscription request:', requestId)

    const request = await prisma.subscriptionRequest.findUnique({
      where: { id: requestId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        plan: { select: { name: true } }
      }
    })

    if (request) {
      console.log('✅ Solicitud encontrada:')
      console.log('   - ID:', request.id)
      console.log('   - Estado:', request.status)
      console.log('   - Usuario:', request.user.name, '(', request.user.email, ')')
      console.log('   - Plan:', request.plan?.name || 'N/A')
      console.log('   - Fecha:', request.requestedAt)
    } else {
      console.log('❌ Solicitud NO encontrada')
      console.log('\n🔍 Buscando solicitudes recientes...')

      const recentRequests = await prisma.subscriptionRequest.findMany({
        take: 5,
        orderBy: { requestedAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          plan: { select: { name: true } }
        }
      })

      console.log(`\n📋 Últimas solicitudes:`)
      recentRequests.forEach((req, idx) => {
        console.log(`\n${idx + 1}. ID: ${req.id}`)
        console.log(`   Usuario: ${req.user.name} (${req.user.email})`)
        console.log(`   Plan: ${req.plan?.name || 'N/A'}`)
        console.log(`   Estado: ${req.status}`)
        console.log(`   Fecha: ${req.requestedAt}`)
      })
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkRequest()
