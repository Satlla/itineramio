const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function auditSystem() {
  try {
    console.log('\n' + '='.repeat(100))
    console.log('🔍 AUDITORÍA COMPLETA DEL SISTEMA DE PLANES Y PRECIOS')
    console.log('='.repeat(100) + '\n')

    // 1. VERIFICAR BASE DE DATOS
    console.log('1️⃣ BASE DE DATOS - subscription_plans\n')
    const dbPlans = await prisma.subscriptionPlan.findMany({
      orderBy: { priceMonthly: 'asc' }
    })
    
    const plansSummary = dbPlans.map(p => ({
      code: p.code,
      name: p.name,
      maxProperties: p.maxProperties,
      priceMonthly: parseFloat(p.priceMonthly),
      priceSemestral: parseFloat(p.priceSemestral),
      priceYearly: parseFloat(p.priceYearly),
      isActive: p.isActive
    }))
    
    console.log('Planes en BD:')
    console.table(plansSummary)

    // 2. VERIFICAR SUSCRIPCIÓN DE JUANITO
    console.log('\n2️⃣ SUSCRIPCIÓN DE JUANITO\n')
    const juanitoSub = await prisma.userSubscription.findFirst({
      where: {
        userId: 'cmh9csfkk000o7coq4x91opn8',
        status: 'ACTIVE'
      },
      include: {
        plan: true
      }
    })
    
    if (juanitoSub) {
      const duration = juanitoSub.endDate - juanitoSub.startDate
      const days = Math.round(duration / (1000 * 60 * 60 * 24))
      
      console.log('Usuario: Juanito')
      console.log('Plan: ' + juanitoSub.plan.code + ' (' + juanitoSub.plan.name + ')')
      console.log('Precio del plan (monthly): €' + juanitoSub.plan.priceMonthly)
      console.log('Precio del plan (semestral): €' + juanitoSub.plan.priceSemestral)
      console.log('Custom Price: ' + (juanitoSub.customPrice || 'N/A'))
      console.log('Start Date: ' + juanitoSub.startDate.toISOString())
      console.log('End Date: ' + juanitoSub.endDate.toISOString())
      console.log('Duración: ' + days + ' días')
      console.log('Billing Period detectado: ' + (days >= 150 && days <= 210 ? 'SEMESTRAL (6 meses)' : days >= 300 ? 'ANUAL' : 'MENSUAL'))
    }

    // 3. VERIFICAR INVOICE DE JUANITO
    console.log('\n3️⃣ FACTURA DE JUANITO\n')
    const juanitoInvoice = await prisma.invoice.findFirst({
      where: {
        userId: 'cmh9csfkk000o7coq4x91opn8',
        subscriptionId: juanitoSub?.id
      },
      orderBy: { createdAt: 'desc' }
    })
    
    if (juanitoInvoice) {
      console.log('Invoice Number: ' + juanitoInvoice.invoiceNumber)
      console.log('Amount: €' + juanitoInvoice.amount)
      console.log('Discount Amount: €' + juanitoInvoice.discountAmount)
      console.log('Final Amount: €' + juanitoInvoice.finalAmount)
      console.log('Status: ' + juanitoInvoice.status)
      console.log('Payment Method: ' + juanitoInvoice.paymentMethod)
    }

    // 4. VERIFICAR SUBSCRIPTION REQUEST
    console.log('\n4️⃣ SUBSCRIPTION REQUEST DE JUANITO\n')
    const juanitoRequest = await prisma.subscriptionRequest.findUnique({
      where: { id: 'cmh9eksdj00037cc8o678nmq0' }
    })
    
    if (juanitoRequest) {
      console.log('Status: ' + juanitoRequest.status)
      console.log('Total Amount: €' + juanitoRequest.totalAmount)
      console.log('Payment Method: ' + juanitoRequest.paymentMethod)
      console.log('Metadata: ' + JSON.stringify(juanitoRequest.metadata))
      console.log('Admin Notes: ' + (juanitoRequest.adminNotes || 'N/A'))
    }

    // 5. VERIFICAR CÁLCULOS DE PRECIOS
    console.log('\n5️⃣ VERIFICACIÓN DE CÁLCULOS\n')
    
    const expectedPrices = {
      BASIC: {
        monthly: 9,
        semestral: 9 * 6 * 0.9,
        yearly: 9 * 12 * 0.8
      },
      HOST: {
        monthly: 29,
        semestral: 29 * 6 * 0.9,
        yearly: 29 * 12 * 0.8
      },
      SUPERHOST: {
        monthly: 69,
        semestral: 69 * 6 * 0.9,
        yearly: 69 * 12 * 0.8
      },
      BUSINESS: {
        monthly: 99,
        semestral: 99 * 6 * 0.9,
        yearly: 99 * 12 * 0.8
      }
    }
    
    console.log('Plan     | Precio DB | Esperado  | Match')
    console.log('-'.repeat(50))
    
    dbPlans.forEach(plan => {
      const expected = expectedPrices[plan.code]
      const dbSemestral = parseFloat(plan.priceSemestral)
      const match = Math.abs(dbSemestral - expected.semestral) < 0.01
      console.log(plan.code.padEnd(9) + '| €' + dbSemestral.toFixed(2).padEnd(8) + '| €' + expected.semestral.toFixed(2).padEnd(8) + '| ' + (match ? '✅' : '❌'))
    })

    // 6. VERIFICAR CONSISTENCIA maxProperties
    console.log('\n6️⃣ VERIFICACIÓN DE LÍMITES DE PROPIEDADES\n')
    
    const expectedProps = {
      BASIC: 2,
      HOST: 10,
      SUPERHOST: 25,
      BUSINESS: 50
    }
    
    console.log('Plan     | DB Props | Esperado | Match')
    console.log('-'.repeat(50))
    
    dbPlans.forEach(plan => {
      const expected = expectedProps[plan.code]
      const match = plan.maxProperties === expected
      console.log(plan.code.padEnd(9) + '| ' + String(plan.maxProperties).padEnd(9) + '| ' + String(expected).padEnd(9) + '| ' + (match ? '✅' : '❌'))
    })

    // 7. VERIFICAR FEATURES CONSISTENCY
    console.log('\n7️⃣ VERIFICACIÓN DE FEATURES\n')
    
    dbPlans.forEach(plan => {
      const firstFeature = plan.features[0] || ''
      const expectedFirstFeature = 'Hasta ' + plan.maxProperties + ' propiedades'
      const match = firstFeature === expectedFirstFeature || firstFeature === 'Hasta ' + plan.maxProperties + ' propiedad' + (plan.maxProperties > 1 ? 'es' : '')
      
      console.log(plan.code + ':')
      console.log('  Primera feature: "' + firstFeature + '"')
      console.log('  Esperada: "' + expectedFirstFeature + '"')
      console.log('  Match: ' + (match ? '✅' : '⚠️'))
      console.log('')
    })

    console.log('\n' + '='.repeat(100))
    console.log('FIN DE AUDITORÍA')
    console.log('='.repeat(100) + '\n')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

auditSystem()
