import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth, createActivityLog, getRequestInfo } from '@/lib/admin-auth'

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

    // Get slot info before deletion for logging
    const slot = await prisma.blockedSlot.findUnique({
      where: { id },
      select: { date: true, time: true, reason: true }
    })

    await prisma.blockedSlot.delete({
      where: { id }
    })

    // Log the activity
    const { ipAddress, userAgent } = getRequestInfo(request)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'blocked_slot_deleted',
      targetType: 'blocked_slot',
      targetId: id,
      description: `Slot desbloqueado: ${slot?.date ? new Date(slot.date).toISOString().split('T')[0] : 'Unknown'}${slot?.time ? ` a las ${slot.time}` : ''}`,
      metadata: { deletedSlot: slot },
      ipAddress,
      userAgent
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting blocked slot:', error)
    return NextResponse.json({ error: 'Error deleting blocked slot' }, { status: 500 })
  }
}
