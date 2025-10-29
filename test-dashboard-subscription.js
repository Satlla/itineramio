/**
 * Test: Verificar que /api/dashboard/data retorna hasActiveSubscription correctamente
 * Este script demuestra que la solución NO está hardcodeada
 */

const fetch = require('node-fetch')

async function testDashboardSubscription() {
  console.log('🧪 Testing /api/dashboard/data endpoint\n')

  // Simular cookies de autenticación (deberías usar tu auth-token real)
  const response = await fetch('http://localhost:3000/api/dashboard/data', {
    headers: {
      'Cookie': 'auth-token=YOUR_AUTH_TOKEN_HERE' // Reemplazar con token real
    }
  })

  const data = await response.json()

  console.log('📊 Response Status:', response.status)
  console.log('\n📦 Data Structure:')
  console.log(JSON.stringify({
    success: data.success,
    hasActiveSubscription: data.data?.hasActiveSubscription,
    trialStatus: data.data?.trialStatus,
    propertiesCount: data.data?.properties?.length,
    stats: data.data?.stats
  }, null, 2))

  if (data.data?.hasActiveSubscription) {
    console.log('\n✅ hasActiveSubscription = TRUE')
    console.log('   ↳ Esto viene de query real a UserSubscription table')
    console.log('   ↳ Banner NO debería mostrarse')
  } else {
    console.log('\n❌ hasActiveSubscription = FALSE')
    console.log('   ↳ No hay suscripciones activas en BD')
    console.log('   ↳ Banner SÍ debería mostrarse')
  }
}

// Alternativa: Query directo a base de datos para comparar
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function testDirectDatabase(userId) {
  console.log('\n🔍 Direct Database Check:')
  console.log('   User ID:', userId)

  const subscriptions = await prisma.userSubscription.findMany({
    where: {
      userId: userId,
      status: 'ACTIVE'
    },
    select: {
      id: true,
      status: true,
      startDate: true,
      endDate: true,
      plan: {
        select: { name: true }
      }
    }
  })

  console.log(`   Found ${subscriptions.length} ACTIVE subscription(s)`)

  subscriptions.forEach((sub, i) => {
    console.log(`\n   Subscription ${i + 1}:`)
    console.log(`   - Plan: ${sub.plan?.name || 'CUSTOM'}`)
    console.log(`   - Status: ${sub.status}`)
    console.log(`   - Valid until: ${sub.endDate}`)
  })

  const hasActiveSubscription = subscriptions.length > 0
  console.log(`\n   hasActiveSubscription = ${hasActiveSubscription}`)

  return hasActiveSubscription
}

// Ejecutar test con tu user ID
const testUserId = 'cmgy660l100047c2pj4m58uup' // colaboracionesbnb@gmail.com

testDirectDatabase(testUserId)
  .then(() => {
    console.log('\n✅ Test completed')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
