import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAdminAuth, createActivityLog, getRequestInfo } from '../../../../../src/lib/admin-auth'

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

    const { 
      name,
      description,
      pricePerProperty,
      minProperties,
      maxProperties,
      maxZonesPerProperty,
      isForHotels,
      requiresApproval,
      features
    } = await request.json()

    // Get the current plan
    const currentPlan = await prisma.customPlan.findUnique({
      where: { id: params.id }
    })

    if (!currentPlan) {
      return NextResponse.json({ error: 'Custom plan not found' }, { status: 404 })
    }

    // Update the plan
    const updatedPlan = await prisma.customPlan.update({
      where: { id: params.id },
      data: {
        name,
        description,
        pricePerProperty: Number(pricePerProperty),
        minProperties: Number(minProperties),
        maxProperties: maxProperties ? Number(maxProperties) : null,
        maxZonesPerProperty: maxZonesPerProperty ? Number(maxZonesPerProperty) : null,
        isForHotels: Boolean(isForHotels),
        requiresApproval: Boolean(requiresApproval),
        features: features || []
      }
    })

    // Log admin activity
    const { ipAddress, userAgent } = getRequestInfo(request)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'CUSTOM_PLAN_UPDATED',
      targetType: 'customPlan',
      targetId: currentPlan.id,
      description: `Plan personalizado "${name}" actualizado`,
      metadata: {
        planName: name,
        changes: {
          name: currentPlan.name !== name ? { from: currentPlan.name, to: name } : undefined,
          pricePerProperty: Number(currentPlan.pricePerProperty) !== Number(pricePerProperty) ? { from: Number(currentPlan.pricePerProperty), to: Number(pricePerProperty) } : undefined,
        }
      },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({
      success: true,
      message: 'Plan actualizado exitosamente',
      customPlan: updatedPlan
    })
    
  } catch (error) {
    console.error('Error updating custom plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}