import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth, createActivityLog, getRequestInfo } from '@/lib/admin-auth'

// DELETE - Delete a unified lead (from Lead table)
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

    // Get lead info before deletion for logging
    const lead = await prisma.lead.findUnique({
      where: { id },
      select: { email: true, source: true }
    })

    // Delete the lead
    await prisma.lead.delete({
      where: { id }
    })

    // Log the activity
    const { ipAddress, userAgent } = getRequestInfo(request)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'lead_deleted',
      targetType: 'lead',
      targetId: id,
      description: `Lead eliminado: ${lead?.email || 'Unknown'}`,
      metadata: { deletedLead: lead },
      ipAddress,
      userAgent
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting lead:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el lead' },
      { status: 500 }
    )
  }
}

// PATCH - Update a unified lead
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

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...(body.source && { source: body.source }),
        ...(body.metadata && { metadata: body.metadata })
      }
    })

    // Log the activity
    const { ipAddress, userAgent } = getRequestInfo(request)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'lead_updated',
      targetType: 'lead',
      targetId: id,
      description: `Lead actualizado: ${lead.email}`,
      metadata: { changes: Object.keys(body) },
      ipAddress,
      userAgent
    })

    return NextResponse.json({ success: true, lead })
  } catch (error) {
    console.error('Error updating lead:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el lead' },
      { status: 500 }
    )
  }
}
