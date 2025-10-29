import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../../../src/lib/admin-auth'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const { isActive } = await request.json()

    // Get the custom plan
    const customPlan = await prisma.customPlan.findUnique({
      where: { id: params.id }
    })

    if (!customPlan) {
      return NextResponse.json({ error: 'Custom plan not found' }, { status: 404 })
    }

    // Update plan status
    const updatedPlan = await prisma.customPlan.update({
      where: { id: params.id },
      data: { isActive }
    })

    // Log admin activity
    await prisma.adminActivityLog.create({
      data: {
        adminUserId: authResult.adminId,
        action: isActive ? 'CUSTOM_PLAN_ACTIVATED' : 'CUSTOM_PLAN_DEACTIVATED',
        targetType: 'customPlan',
        targetId: customPlan.id,
        description: `Plan personalizado "${customPlan.name}" ${isActive ? 'activado' : 'desactivado'}`,
        metadata: {
          planName: customPlan.name,
          previousStatus: customPlan.isActive,
          newStatus: isActive
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Plan ${isActive ? 'activado' : 'desactivado'} exitosamente`,
      customPlan: updatedPlan
    })
    
  } catch (error) {
    console.error('Error toggling custom plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}