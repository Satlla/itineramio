#!/usr/bin/env node

/**
 * Script to verify database plans match our plans.ts configuration
 * Run: node verify-database-plans.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const EXPECTED_PLANS = {
  BASIC: {
    maxProperties: 2,
    priceMonthly: 9,
    priceSemestral: 48.6,
    priceYearly: 86.4,
  },
  HOST: {
    maxProperties: 10,
    priceMonthly: 19,
    priceSemestral: 102.6,
    priceYearly: 182.4,
  },
  SUPERHOST: {
    maxProperties: 25,
    priceMonthly: 39,
    priceSemestral: 210.6,
    priceYearly: 374.4,
  },
  BUSINESS: {
    maxProperties: 999,
    priceMonthly: 0, // Custom pricing
    priceSemestral: 0,
    priceYearly: 0,
  }
}

const FORBIDDEN_PLANS = ['MANAGER', 'STARTER', 'FREE', 'GRATUITO']

async function verifyPlans() {
  console.log('🔍 Verificando planes en la base de datos...\n')

  try {
    // Get all plans from database
    const dbPlans = await prisma.subscriptionPlan.findMany({
      orderBy: { code: 'asc' }
    })

    console.log(`📊 Total de planes en DB: ${dbPlans.length}\n`)

    // Check for forbidden plans
    const forbiddenFound = []
    for (const plan of dbPlans) {
      if (FORBIDDEN_PLANS.includes(plan.code)) {
        forbiddenFound.push(plan.code)
      }
    }

    if (forbiddenFound.length > 0) {
      console.log('❌ PLANES NO AUTORIZADOS ENCONTRADOS:')
      forbiddenFound.forEach(code => console.log(`   - ${code}`))
      console.log('')
    } else {
      console.log('✅ No se encontraron planes no autorizados\n')
    }

    // Check each expected plan
    console.log('📋 Verificación de planes autorizados:\n')

    for (const [code, expected] of Object.entries(EXPECTED_PLANS)) {
      const dbPlan = dbPlans.find(p => p.code === code)

      if (!dbPlan) {
        console.log(`❌ ${code}: NO EXISTE EN DB`)
        continue
      }

      console.log(`✅ ${code}: Encontrado`)

      // Verify prices
      const monthlyMatch = Number(dbPlan.priceMonthly) === expected.priceMonthly
      const semestralMatch = Number(dbPlan.priceSemestral) === expected.priceSemestral
      const yearlyMatch = Number(dbPlan.priceYearly) === expected.priceYearly
      const propertiesMatch = dbPlan.maxProperties === expected.maxProperties

      if (!monthlyMatch) {
        console.log(`   ⚠️  Precio mensual: DB=${dbPlan.priceMonthly}, Esperado=${expected.priceMonthly}`)
      }
      if (!semestralMatch) {
        console.log(`   ⚠️  Precio semestral: DB=${dbPlan.priceSemestral}, Esperado=${expected.priceSemestral}`)
      }
      if (!yearlyMatch) {
        console.log(`   ⚠️  Precio anual: DB=${dbPlan.priceYearly}, Esperado=${expected.priceYearly}`)
      }
      if (!propertiesMatch) {
        console.log(`   ⚠️  Max propiedades: DB=${dbPlan.maxProperties}, Esperado=${expected.maxProperties}`)
      }

      if (monthlyMatch && semestralMatch && yearlyMatch && propertiesMatch) {
        console.log(`   ✓ Todos los valores coinciden correctamente`)
      }

      console.log('')
    }

    // List all plans in DB for reference
    console.log('📑 Todos los planes en la base de datos:\n')
    for (const plan of dbPlans) {
      console.log(`- ${plan.code} (${plan.name})`)
      console.log(`  Mensual: €${plan.priceMonthly} | Semestral: €${plan.priceSemestral} | Anual: €${plan.priceYearly}`)
      console.log(`  Max props: ${plan.maxProperties} | Activo: ${plan.isActive} | Visible: ${plan.isVisibleInUI}`)
      console.log('')
    }

  } catch (error) {
    console.error('❌ Error verificando planes:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

verifyPlans()
