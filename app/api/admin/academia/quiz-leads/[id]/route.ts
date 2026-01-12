import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE - Delete a quiz lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.quizLead.delete({
      where: { id }
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
    const { id } = await params
    const body = await request.json()

    const lead = await prisma.quizLead.update({
      where: { id },
      data: {
        ...(body.converted !== undefined && { converted: body.converted }),
        ...(body.fullName && { fullName: body.fullName })
      }
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
