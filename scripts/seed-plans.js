const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedPlans() {
  try {
    console.log('🌱 Creando planes de suscripción...');
    
    // Eliminar planes existentes
    await prisma.subscriptionPlan.deleteMany();
    console.log('🗑️ Planes existentes eliminados');
    
    const plans = [
      {
        name: 'Gratuito',
        description: 'Plan básico sin funciones AI',
        priceMonthly: 0,
        priceYearly: 0,
        aiMessagesIncluded: 0,
        maxProperties: 1,
        features: ['basic_manual', 'qr_codes'],
        isActive: true
      },
      {
        name: 'Premium',
        description: 'Incluye chatbot AI y funciones avanzadas',
        priceMonthly: 29,
        priceYearly: 290,
        aiMessagesIncluded: 500,
        maxProperties: 3,
        features: ['ai_chatbot', 'analytics', 'whatsapp_notifications', 'priority_support'],
        isActive: true
      },
      {
        name: 'Profesional',
        description: 'Para gestores con múltiples propiedades',
        priceMonthly: 59,
        priceYearly: 590,
        aiMessagesIncluded: 2000,
        maxProperties: 10,
        features: ['ai_chatbot', 'analytics', 'whatsapp_notifications', 'priority_support', 'custom_branding'],
        isActive: true
      },
      {
        name: 'Enterprise',
        description: 'Para empresas grandes con necesidades especiales',
        priceMonthly: 149,
        priceYearly: 1490,
        aiMessagesIncluded: 10000,
        maxProperties: 50,
        features: ['ai_chatbot', 'analytics', 'whatsapp_notifications', 'priority_support', 'custom_branding', 'api_access', 'dedicated_support'],
        isActive: true
      }
    ];

    const createdPlans = await Promise.all(
      plans.map(plan => 
        prisma.subscriptionPlan.create({
          data: plan
        })
      )
    );

    console.log(`✅ ${createdPlans.length} planes creados exitosamente:`);
    createdPlans.forEach(plan => {
      console.log(`   - ${plan.name}: €${plan.priceMonthly}/mes`);
    });
    
  } catch (error) {
    console.error('❌ Error creando planes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPlans();