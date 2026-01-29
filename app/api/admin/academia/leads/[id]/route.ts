import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth, createActivityLog, getRequestInfo } from '@/lib/admin-auth'

// DELETE - Delete an academia lead (EmailSubscriber)
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
      action: 'academia_lead_deleted',
      targetType: 'email_subscriber',
      targetId: id,
      description: `Lead academia eliminado: ${lead?.email || 'Unknown'}`,
      ipAddress,
      userAgent
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting academia lead:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el lead' },
      { status: 500 }
    )
  }
}
