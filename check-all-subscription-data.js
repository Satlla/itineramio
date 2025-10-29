const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAllData() {
  try {
    console.log('🔍 Verificando TODAS las inconsistencias en colaboracionesbnb@gmail.com\n')

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: 'colaboracionesbnb@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        subscription: true,
        status: true
      }
    })

    if (!user) {
      console.error('❌ Usuario no encontrado')
      return
    }

    console.log('👤 USUARIO:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Nombre: ${user.name}`)
    console.log(`   Campo "subscription": ${user.subscription}`)
    console.log(`   Status: ${user.status}\n`)

    // Buscar TODAS las solicitudes (no solo las aprobadas)
    const allRequests = await prisma.subscriptionRequest.findMany({
      where: { userId: user.id },
      include: {
        plan: {
          select: { name: true, code: true, priceMonthly: true, priceSemestral: true }
        }
      },
      orderBy: { requestedAt: 'desc' }
    })

    console.log(`📋 SOLICITUDES DE SUSCRIPCIÓN: ${allRequests.length}`)
    allRequests.forEach((req, idx) => {
      console.log(`\n   ${idx + 1}. ID: ${req.id.slice(-8)}`)
      console.log(`      Estado: ${req.status}`)
      console.log(`      Plan: ${req.plan?.name || 'N/A'}`)
      console.log(`      Importe: €${req.totalAmount}`)
      console.log(`      Método de pago: ${req.paymentMethod}`)
      console.log(`      Metadata: ${JSON.stringify(req.metadata)}`)
      console.log(`      Admin Notes: ${req.adminNotes || 'N/A'}`)
      console.log(`      Fecha solicitud: ${req.requestedAt.toLocaleDateString('es-ES')}`)
      if (req.approvedAt) {
        console.log(`      Fecha aprobación: ${req.approvedAt.toLocaleDateString('es-ES')}`)
      }
    })

    // Buscar TODAS las suscripciones activas/inactivas
    const allSubscriptions = await prisma.userSubscription.findMany({
      where: { userId: user.id },
      include: {
        plan: {
          select: { name: true, code: true, priceMonthly: true, priceSemestral: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`\n\n💳 SUSCRIPCIONES USUARIO: ${allSubscriptions.length}`)
    allSubscriptions.forEach((sub, idx) => {
      const startDate = new Date(sub.startDate)
      const endDate = new Date(sub.endDate)
      const durationDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24))
      const durationMonths = Math.round(durationDays / 30)

      // Extraer período de las notas
      let billingPeriodFromNotes = 'No especificado'
      if (sub.notes) {
        const match = sub.notes.match(/Período:\s*(Mensual|Semestral|Anual)/i)
        if (match) {
          billingPeriodFromNotes = match[1]
        }
      }

      console.log(`\n   ${idx + 1}. ID: ${sub.id.slice(-8)}`)
      console.log(`      Status: ${sub.status}`)
      console.log(`      Plan DB: ${sub.plan?.name || 'N/A'} (${sub.plan?.code || 'N/A'})`)
      console.log(`      Inicio: ${startDate.toLocaleDateString('es-ES')}`)
      console.log(`      Fin: ${endDate.toLocaleDateString('es-ES')}`)
      console.log(`      Duración: ${durationDays} días (~${durationMonths} meses)`)
      console.log(`      Período en notas: ${billingPeriodFromNotes}`)
      console.log(`      Notas completas: ${sub.notes || 'N/A'}`)
      console.log(`      Custom price: ${sub.customPrice || 'N/A'}`)
      console.log(`      Discount: ${sub.discountPercentage || 0}%`)
    })

    // ANÁLISIS DE INCONSISTENCIAS
    console.log('\n\n🔍 ANÁLISIS DE INCONSISTENCIAS:\n')

    const approvedRequest = allRequests.find(r => r.status === 'APPROVED')
    const activeSubscription = allSubscriptions.find(s => s.status === 'ACTIVE')

    if (!approvedRequest) {
      console.log('⚠️  No hay solicitud APPROVED')
    }

    if (!activeSubscription) {
      console.log('⚠️  No hay suscripción ACTIVE')
    }

    if (approvedRequest && activeSubscription) {
      console.log('✅ Solicitud aprobada encontrada')
      console.log('✅ Suscripción activa encontrada\n')

      // Comparar datos
      const issues = []

      // 1. Verificar campo User.subscription
      const expectedUserSubscription = activeSubscription.plan?.name || 'CUSTOM'
      if (user.subscription !== expectedUserSubscription) {
        issues.push({
          field: 'User.subscription',
          current: user.subscription,
          expected: expectedUserSubscription,
          reason: 'Debería coincidir con el plan de la suscripción activa'
        })
      }

      // 2. Verificar billing period en metadata vs notas
      const metadataBilling = approvedRequest.metadata?.billingPeriod
      const notesBilling = activeSubscription.notes?.match(/Período:\s*(Mensual|Semestral|Anual)/i)?.[1]

      const expectedBillingLabel = metadataBilling === 'semiannual' || metadataBilling === 'BIANNUAL' ? 'Semestral' :
                                    metadataBilling === 'annual' || metadataBilling === 'ANNUAL' ? 'Anual' :
                                    'Mensual'

      if (notesBilling !== expectedBillingLabel) {
        issues.push({
          field: 'UserSubscription.notes (Período)',
          current: notesBilling,
          expected: expectedBillingLabel,
          reason: `Metadata indica ${metadataBilling}, debería ser ${expectedBillingLabel}`
        })
      }

      // 3. Verificar duración de la suscripción
      const startDate = new Date(activeSubscription.startDate)
      const endDate = new Date(activeSubscription.endDate)
      const durationMonths = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24) / 30)

      const expectedDuration = metadataBilling === 'semiannual' || metadataBilling === 'BIANNUAL' ? 6 :
                               metadataBilling === 'annual' || metadataBilling === 'ANNUAL' ? 12 : 1

      if (Math.abs(durationMonths - expectedDuration) > 0.5) {
        issues.push({
          field: 'UserSubscription.endDate (Duración)',
          current: `${durationMonths} meses`,
          expected: `${expectedDuration} meses`,
          reason: `Metadata indica ${metadataBilling}, la duración no coincide`
        })
      }

      // 4. Verificar importe vs plan
      const expectedPrice = metadataBilling === 'semiannual' || metadataBilling === 'BIANNUAL' ?
                            (activeSubscription.plan?.priceSemestral || approvedRequest.totalAmount) :
                            metadataBilling === 'annual' || metadataBilling === 'ANNUAL' ?
                            (activeSubscription.plan?.priceMonthly * 12 || approvedRequest.totalAmount) :
                            (activeSubscription.plan?.priceMonthly || approvedRequest.totalAmount)

      // Mostrar inconsistencias
      if (issues.length === 0) {
        console.log('✅ NO SE ENCONTRARON INCONSISTENCIAS')
      } else {
        console.log(`❌ SE ENCONTRARON ${issues.length} INCONSISTENCIAS:\n`)
        issues.forEach((issue, idx) => {
          console.log(`${idx + 1}. ${issue.field}`)
          console.log(`   Actual: ${issue.current}`)
          console.log(`   Esperado: ${issue.expected}`)
          console.log(`   Razón: ${issue.reason}\n`)
        })
      }

      // Generar correcciones
      if (issues.length > 0) {
        console.log('\n💡 CORRECCIONES SUGERIDAS:\n')

        issues.forEach((issue) => {
          if (issue.field === 'User.subscription') {
            console.log(`1. Actualizar User.subscription de "${issue.current}" a "${issue.expected}"`)
          }
          if (issue.field === 'UserSubscription.notes (Período)') {
            console.log(`2. Actualizar notas de suscripción para que diga "Período: ${issue.expected}"`)
          }
          if (issue.field === 'UserSubscription.endDate (Duración)') {
            const correctEndDate = new Date(activeSubscription.startDate)
            const monthsToAdd = parseInt(issue.expected)
            correctEndDate.setMonth(correctEndDate.getMonth() + monthsToAdd)
            console.log(`3. Actualizar endDate a ${correctEndDate.toISOString()} (${issue.expected})`)
          }
        })

        console.log('\n📝 Para aplicar las correcciones, ejecuta:')
        console.log('   node check-all-subscription-data.js --fix')
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllData()
