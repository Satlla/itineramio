import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    const { id } = await params

    await prisma.consultationBooking.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json({ error: 'Error deleting booking' }, { status: 500 })
  }
}
