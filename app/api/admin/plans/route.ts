import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement requireAdmin(request) when auth is ready
    
    const plans = await prisma.subscriptionPlan.findMany({
      include: {
        _count: {
          select: { subscriptions: true }
        }
      },
      orderBy: { priceMonthly: 'asc' }
    });

    return NextResponse.json({
      success: true,
      plans: plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        aiMessagesIncluded: plan.aiMessagesIncluded,
        maxProperties: plan.maxProperties,
        features: plan.features,
        isActive: plan.isActive,
        _count: plan._count
      }))
    });

  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Implement requireAdmin(request) when auth is ready
    
    const { 
      name, 
      description, 
      priceMonthly, 
      priceYearly,
      aiMessagesIncluded,
      maxProperties,
      features 
    } = await request.json();

    // Validations
    if (!name || priceMonthly === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name and priceMonthly are required' 
      }, { status: 400 });
    }

    const newPlan = await prisma.subscriptionPlan.create({
      data: {
        name,
        description: description || null,
        priceMonthly: parseFloat(priceMonthly),
        priceYearly: priceYearly ? parseFloat(priceYearly) : null,
        aiMessagesIncluded: parseInt(aiMessagesIncluded) || 0,
        maxProperties: parseInt(maxProperties) || 1,
        features: features || [],
        isActive: true
      }
    });

    // Log activity
    await prisma.adminActivityLog.create({
      data: {
        adminUserId: 'admin', // TODO: Get actual admin ID
        action: 'plan_created',
        targetType: 'plan',
        targetId: newPlan.id,
        description: `Created plan ${name}`,
        metadata: { 
          priceMonthly: newPlan.priceMonthly,
          aiMessages: newPlan.aiMessagesIncluded
        }
      }
    });

    return NextResponse.json({
      success: true,
      plan: newPlan,
      message: 'Plan created successfully'
    });

  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}