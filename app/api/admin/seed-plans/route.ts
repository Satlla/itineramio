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
        name: 'Basic',
        code: 'BASIC',
        description: 'Perfecto para comenzar con tus primeras propiedades',
        priceMonthly: 9,
        priceSemestral: 48.6,
        priceYearly: 86.4,
        aiMessagesIncluded: 0,
        maxProperties: 2,
        features: ['basic_manual', 'qr_codes'],
        isActive: true
      },
      {
        name: 'Host',
        code: 'HOST',
        description: 'Ideal para hosts con múltiples propiedades',
        priceMonthly: 29,
        priceSemestral: 156.6,
        priceYearly: 278.4,
        aiMessagesIncluded: 0,
        maxProperties: 10,
        features: ['basic_manual', 'qr_codes', 'analytics', 'priority_support'],
        isActive: true
      },
      {
        name: 'Superhost',
        code: 'SUPERHOST',
        description: 'Para superhosts con gran volumen de propiedades',
        priceMonthly: 69,
        priceSemestral: 372.6,
        priceYearly: 662.4,
        aiMessagesIncluded: 0,
        maxProperties: 25,
        features: ['basic_manual', 'qr_codes', 'analytics', 'priority_support', 'custom_branding'],
        isActive: true
      },
      {
        name: 'Business',
        code: 'BUSINESS',
        description: 'Solución empresarial para grandes gestores',
        priceMonthly: 99,
        priceSemestral: 534.6,
        priceYearly: 950.4,
        aiMessagesIncluded: 0,
        maxProperties: 50,
        features: ['basic_manual', 'qr_codes', 'analytics', 'priority_support', 'custom_branding', 'api_access'],
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