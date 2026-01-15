import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import { requireAdminAuth, createActivityLog, getRequestInfo } from '../../../../src/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
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
        priceMonthly: Number(plan.priceMonthly),
        priceYearly: plan.priceYearly ? Number(plan.priceYearly) : null,
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
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    const {
      name,
      code,
      description,
      priceMonthly,
      priceYearly,
      aiMessagesIncluded,
      maxProperties,
      features
    } = await request.json();

    // Validations
    if (!name || !code || priceMonthly === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Name, code and priceMonthly are required'
      }, { status: 400 });
    }

    const newPlan = await prisma.subscriptionPlan.create({
      data: {
        name,
        code,
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
    const { ipAddress, userAgent } = getRequestInfo(request)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'plan_created',
      targetType: 'plan',
      targetId: newPlan.id,
      description: `Created plan ${name}`,
      metadata: {
        priceMonthly: newPlan.priceMonthly,
        aiMessages: newPlan.aiMessagesIncluded
      },
      ipAddress,
      userAgent,
    })

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