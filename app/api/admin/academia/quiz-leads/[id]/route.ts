import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth, createActivityLog, getRequestInfo } from '@/lib/admin-auth'

// DELETE - Delete a quiz lead
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
    const lead = await prisma.quizLead.findUnique({
      where: { id },
      select: { email: true, fullName: true }
    })

    await prisma.quizLead.delete({
      where: { id }
    })

    // Log the activity
    const { ipAddress, userAgent } = getRequestInfo(request)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'quiz_lead_deleted',
      targetType: 'quiz_lead',
      targetId: id,
      description: `Quiz lead eliminado: ${lead?.email || 'Unknown'}`,
      ipAddress,
      userAgent
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quiz lead:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el lead' },
      { status: 500 }
    )
  }
}

// PATCH - Update a quiz lead
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

    const lead = await prisma.quizLead.update({
      where: { id },
      data: {
        ...(body.converted !== undefined && { converted: body.converted }),
        ...(body.fullName && { fullName: body.fullName })
      }
    })

    // Log the activity
    const { ipAddress, userAgent } = getRequestInfo(request)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'quiz_lead_updated',
      targetType: 'quiz_lead',
      targetId: id,
      description: `Quiz lead actualizado: ${lead.email}`,
      metadata: { changes: Object.keys(body) },
      ipAddress,
      userAgent
    })

    return NextResponse.json({ success: true, lead })
  } catch (error) {
    console.error('Error updating quiz lead:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el lead' },
      { status: 500 }
    )
  }
}
