const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verifyUserDisplay() {
  try {
    console.log('🔍 Verificando cómo se mostrará colaboracionesbnb@gmail.com en el admin\n')

    // Simular la consulta que hace la API /api/admin/users/[id]/route.ts
    const user = await prisma.user.findUnique({
      where: { email: 'colaboracionesbnb@gmail.com' },
      include: {
        subscriptions: {
          include: {
            plan: {
              select: {
                id: true,
                name: true,
                code: true,
                priceMonthly: true,
                priceSemestral: true,
                priceYearly: true,
                maxProperties: true
              }
            }
          },
          where: {
            status: 'ACTIVE'
          },
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      console.error('❌ Usuario no encontrado')
      return
    }

    console.log('👤 USUARIO:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Nombre: ${user.name}`)
    console.log(`   Campo "subscription": ${user.subscription}\n`)

    const currentSubscription = user.subscriptions[0] || null

    if (!currentSubscription) {
      console.log('❌ No hay suscripción activa')
      return
    }

    console.log('💳 SUSCRIPCIÓN ACTIVA:')
    console.log(`   ID: ${currentSubscription.id}`)
    console.log(`   Plan: ${currentSubscription.plan?.name || 'N/A'}`)
    console.log(`   Notas: ${currentSubscription.notes || 'N/A'}`)

    // Simular la lógica del frontend en UserProfileModal.tsx
    const planName = currentSubscription.plan?.name || user.subscription
    const billingPeriodMatch = currentSubscription.notes?.match(/Período:\s*(Mensual|Semestral|Anual)/i)
    const billingPeriod = billingPeriodMatch ? billingPeriodMatch[1] : null
    const displayText = billingPeriod ? `${planName} (${billingPeriod})` : planName

    console.log('\n📊 RESULTADO EN ADMIN PANEL:')
    console.log(`   Plan Name: ${planName}`)
    console.log(`   Billing Period Extraído: ${billingPeriod || 'No encontrado'}`)
    console.log(`   ✅ DISPLAY FINAL: "${displayText}"`)

    // Verificar que sea correcto
    const expectedDisplay = 'HOST (Semestral)'
    if (displayText === expectedDisplay) {
      console.log(`\n✅ ÉXITO: Se mostrará correctamente como "${expectedDisplay}"`)
    } else {
      console.log(`\n❌ ERROR: Se esperaba "${expectedDisplay}" pero se mostrará "${displayText}"`)
    }

  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyUserDisplay()
