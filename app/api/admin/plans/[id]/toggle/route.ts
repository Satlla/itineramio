import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../src/lib/prisma';
import { requireAdminAuth, createActivityLog, getRequestInfo } from '../../../../../../src/lib/admin-auth';

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
    
    const { isActive } = await request.json();
    const { id: planId } = await params;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ 
        success: false, 
        error: 'isActive must be a boolean' 
      }, { status: 400 });
    }

    // Check if plan exists
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      select: { id: true, name: true, isActive: true }
    });

    if (!plan) {
      return NextResponse.json({ 
        success: false, 
        error: 'Plan not found' 
      }, { status: 404 });
    }

    // Update plan status
    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: { isActive }
    });

    // Log activity
    const { ipAddress, userAgent } = getRequestInfo(request)
    await createActivityLog({
      adminId: authResult.adminId,
      action: isActive ? 'plan_activated' : 'plan_deactivated',
      targetType: 'plan',
      targetId: planId,
      description: `${isActive ? 'Activated' : 'Deactivated'} plan ${plan.name}`,
      metadata: {
        previousStatus: plan.isActive,
        newStatus: isActive,
        planName: plan.name
      },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({
      success: true,
      plan: updatedPlan,
      message: `Plan ${isActive ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Error toggling plan status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}