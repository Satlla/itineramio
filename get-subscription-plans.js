const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function getPlans() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { priceMonthly: 'asc' }
    })
    
    console.log('\n📋 PLANES DE SUSCRIPCIÓN EN BASE DE DATOS:\n')
    console.log('Total planes:', plans.length)
    console.log('\n' + '='.repeat(80) + '\n')
    
    plans.forEach((plan, index) => {
      console.log((index + 1) + '. ' + plan.name + ' (' + plan.code + ')')
      console.log('   ID: ' + plan.id)
      console.log('   Precio mensual: €' + plan.priceMonthly)
      console.log('   Propiedades: ' + plan.maxProperties)
      console.log('   Features: ' + JSON.stringify(plan.features, null, 2))
      console.log('   Descripción: ' + (plan.description || 'N/A'))
      console.log('   Activo: ' + plan.isActive)
      console.log('   Creado: ' + plan.createdAt)
      console.log('\n' + '-'.repeat(80) + '\n')
    })
    
    // También mostrar en formato JSON limpio
    console.log('\n📦 FORMATO JSON:\n')
    console.log(JSON.stringify(plans, null, 2))
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

getPlans()
