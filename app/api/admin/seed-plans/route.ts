import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { masterKey } = await request.json();
    
    if (masterKey !== 'itineramio-admin-2024') {
      return NextResponse.json({ error: 'Invalid master key' }, { status: 401 });
    }

    // Crear planes por defecto
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

    // Eliminar planes existentes y crear nuevos
    await prisma.subscriptionPlan.deleteMany();
    
    const createdPlans = await Promise.all(
      plans.map(plan => 
        prisma.subscriptionPlan.create({
          data: plan
        })
      )
    );

    return NextResponse.json({ 
      success: true, 
      message: `Created ${createdPlans.length} subscription plans`,
      plans: createdPlans
    });

  } catch (error) {
    console.error('Error seeding plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}