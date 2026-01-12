import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE - Delete a marketing lead (EmailSubscriber)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.emailSubscriber.delete({
      where: { id }
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

    return NextResponse.json({ success: true, lead })
  } catch (error) {
    console.error('Error updating marketing lead:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el lead' },
      { status: 500 }
    )
  }
}
