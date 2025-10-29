const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyUserSubscription() {
  try {
    console.log('🔍 Verificando suscripción del usuario colaboracionesbnb@gmail.com...\n')

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: 'colaboracionesbnb@gmail.com' },
      include: {
        properties: {
          select: { id: true, name: true, status: true, isPublished: true }
        }
      }
    })

    if (!user) {
      console.log('❌ Usuario no encontrado')
      return
    }

    console.log('👤 Usuario encontrado:')
    console.log('  ID:', user.id)
    console.log('  Nombre:', user.name)
    console.log('  Email:', user.email)
    console.log('  Subscription field:', user.subscription)
    console.log('  Propiedades:', user.properties.length)
    console.log('')

    // Verificar UserSubscription
    const userSubscriptions = await prisma.userSubscription.findMany({
      where: { userId: user.id },
      include: {
        plan: { select: { name: true, code: true, maxProperties: true } },
        customPlan: { select: { name: true, maxProperties: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📋 UserSubscriptions encontradas: ${userSubscriptions.length}`)
    userSubscriptions.forEach((sub, index) => {
      console.log(`\n${index + 1}. Suscripción ID: ${sub.id}`)
      console.log('   Status:', sub.status)
      console.log('   Plan:', sub.plan?.name || sub.customPlan?.name || 'N/A')
      console.log('   Plan code:', sub.plan?.code || 'Custom')
      console.log('   Max properties:', sub.plan?.maxProperties || sub.customPlan?.maxProperties || 'N/A')
      console.log('   Start date:', sub.startDate)
      console.log('   End date:', sub.endDate)
      console.log('   Created at:', sub.createdAt)
      console.log('   Notes:', sub.notes || 'N/A')
    })

    // Verificar SubscriptionRequest
    const subscriptionRequests = await prisma.subscriptionRequest.findMany({
      where: { userId: user.id },
      include: {
        plan: { select: { name: true, code: true, maxProperties: true } }
      },
      orderBy: { requestedAt: 'desc' }
    })

    console.log(`\n📬 SubscriptionRequests: ${subscriptionRequests.length}`)
    subscriptionRequests.forEach((req, index) => {
      console.log(`\n${index + 1}. Request ID: ${req.id}`)
      console.log('   Status:', req.status)
      console.log('   Plan:', req.plan?.name)
      console.log('   Plan code:', req.plan?.code)
      console.log('   Amount:', `€${Number(req.totalAmount).toFixed(2)}`)
      console.log('   Requested at:', req.requestedAt)
      console.log('   Approved at:', req.approvedAt || 'Not approved')
      console.log('   Admin notes:', req.adminNotes || 'N/A')
    })

    // Verificar facturas
    const invoices = await prisma.invoice.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`\n💰 Invoices: ${invoices.length}`)
    invoices.forEach((inv, index) => {
      console.log(`\n${index + 1}. Invoice: ${inv.invoiceNumber}`)
      console.log('   Amount:', `€${Number(inv.finalAmount).toFixed(2)}`)
      console.log('   Status:', inv.status)
      console.log('   Created at:', inv.createdAt)
      console.log('   Subscription ID:', inv.subscriptionId || 'N/A')
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyUserSubscription()
