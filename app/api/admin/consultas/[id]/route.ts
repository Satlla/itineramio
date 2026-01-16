import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth, createActivityLog, getRequestInfo } from '@/lib/admin-auth'

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

    const updateData: Record<string, unknown> = {}

    if (body.status) {
      updateData.status = body.status
      if (body.status === 'completed') {
        updateData.completedAt = new Date()
      }
    }

    if (body.adminNotes !== undefined) {
      updateData.adminNotes = body.adminNotes
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes
    }

    const booking = await prisma.consultationBooking.update({
      where: { id },
      data: updateData
    })

    // Log the activity
    const { ipAddress, userAgent } = getRequestInfo(request)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'consultation_updated',
      targetType: 'consultation_booking',
      targetId: id,
      description: `Consulta actualizada: ${booking.name}`,
      metadata: { changes: Object.keys(updateData) },
      ipAddress,
      userAgent
    })

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Error updating booking' }, { status: 500 })
  }
}

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

    // Get booking info before deletion for logging
    const booking = await prisma.consultationBooking.findUnique({
      where: { id },
      select: { name: true, email: true }
    })

    await prisma.consultationBooking.delete({
      where: { id }
    })

    // Log the activity
    const { ipAddress, userAgent } = getRequestInfo(request)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'consultation_deleted',
      targetType: 'consultation_booking',
      targetId: id,
      description: `Consulta eliminada: ${booking?.name || 'Unknown'}`,
      metadata: { deletedBooking: booking },
      ipAddress,
      userAgent
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json({ error: 'Error deleting booking' }, { status: 500 })
  }
}
