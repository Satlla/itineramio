import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../src/lib/prisma';
import { requireAdminAuth } from '../../../../../src/lib/admin-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    const { id: planId } = await params;
    const { 
      name, 
      description, 
      priceMonthly, 
      priceYearly,
      aiMessagesIncluded,
      maxProperties,
      features 
    } = await request.json();

    // Check if plan exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!existingPlan) {
      return NextResponse.json({ 
        success: false, 
        error: 'Plan not found' 
      }, { status: 404 });
    }

    // Update plan
    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(priceMonthly !== undefined && { priceMonthly: parseFloat(priceMonthly) }),
        ...(priceYearly !== undefined && { priceYearly: priceYearly ? parseFloat(priceYearly) : null }),
        ...(aiMessagesIncluded !== undefined && { aiMessagesIncluded: parseInt(aiMessagesIncluded) }),
        ...(maxProperties !== undefined && { maxProperties: parseInt(maxProperties) }),
        ...(features !== undefined && { features })
      }
    });

    // Log activity
    await prisma.adminActivityLog.create({
      data: {
        adminUserId: authResult.adminId,
        action: 'plan_updated',
        targetType: 'plan',
        targetId: planId,
        description: `Updated plan ${name || existingPlan.name}`,
        metadata: { 
          changes: {
            ...(name && name !== existingPlan.name && { name: { from: existingPlan.name, to: name } }),
            ...(priceMonthly !== undefined && priceMonthly !== existingPlan.priceMonthly && { 
              priceMonthly: { from: existingPlan.priceMonthly, to: priceMonthly } 
            })
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      plan: updatedPlan,
      message: 'Plan updated successfully'
    });

  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    const { id: planId } = await params;

    // Check if plan exists
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: {
        _count: {
          select: { subscriptions: true }
        }
      }
    });

    if (!plan) {
      return NextResponse.json({ 
        success: false, 
        error: 'Plan not found' 
      }, { status: 404 });
    }

    // Prevent deletion if plan has active subscriptions
    if (plan._count.subscriptions > 0) {
      return NextResponse.json({ 
        success: false, 
        error: `Cannot delete plan with ${plan._count.subscriptions} active subscriptions` 
      }, { status: 400 });
    }

    // Delete plan
    await prisma.subscriptionPlan.delete({
      where: { id: planId }
    });

    // Log activity
    await prisma.adminActivityLog.create({
      data: {
        adminUserId: authResult.adminId,
        action: 'plan_deleted',
        targetType: 'plan',
        targetId: planId,
        description: `Deleted plan ${plan.name}`,
        metadata: { 
          planName: plan.name,
          priceMonthly: plan.priceMonthly
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Plan deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}