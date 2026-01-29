import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth, createActivityLog, getRequestInfo } from '@/lib/admin-auth'

// DELETE - Delete a marketing lead (EmailSubscriber)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const { id } = await params

    // Get lead info before deletion
    const lead = await prisma.emailSubscriber.findUnique({
      where: { id },
      select: { email: true }
    })

    await prisma.emailSubscriber.delete({
      where: { id }
    })

    // Log the activity
    const { ipAddress, userAgent } = getRequestInfo(request)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'marketing_lead_deleted',
      targetType: 'email_subscriber',
      targetId: id,
      description: `Lead marketing eliminado: ${lead?.email || 'Unknown'}`,
      ipAddress,
      userAgent
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting marketing lead:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el lead' },
      { status: 500 }
    )
  }
}

// PATCH - Update a marketing lead
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const { id } = await params
    const body = await request.json()

    const lead = await prisma.emailSubscriber.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.source && { source: body.source }),
        ...(body.tags && { tags: body.tags }),
        ...(body.archetype && { archetype: body.archetype }),
        ...(body.status && { status: body.status }),
        ...(body.engagementScore && { engagementScore: body.engagementScore }),
        ...(body.currentJourneyStage && { currentJourneyStage: body.currentJourneyStage })
      }
    })

    // Log the activity
    const { ipAddress, userAgent } = getRequestInfo(request)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'marketing_lead_updated',
      targetType: 'email_subscriber',
      targetId: id,
      description: `Lead marketing actualizado: ${lead.email}`,
      metadata: { changes: Object.keys(body) },
      ipAddress,
      userAgent
    })

    return NextResponse.json({ success: true, lead })
  } catch (error) {
    console.error('Error updating marketing lead:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el lead' },
      { status: 500 }
    )
  }
}
