import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { getAdminUser } from '../../../../../src/lib/admin-auth'

// Update a FAQ submission (answer, change status, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check admin authentication using admin-token
    const adminPayload = await getAdminUser(request)
    if (!adminPayload) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get admin name for answeredBy field
    const admin = await prisma.admin.findUnique({
      where: { id: adminPayload.adminId },
      select: { name: true }
    })

    const { answer, status, category, isPublished, publishedId } = await request.json()

    // Update the submission
    const updated = await prisma.faqSubmission.update({
      where: { id },
      data: {
        ...(answer !== undefined && { answer }),
        ...(status !== undefined && { status }),
        ...(category !== undefined && { category }),
        ...(isPublished !== undefined && { isPublished }),
        ...(publishedId !== undefined && { publishedId }),
        ...(answer && !status && { status: 'ANSWERED', answeredAt: new Date(), answeredBy: admin?.name || adminPayload.email })
      }
    })

    return NextResponse.json({
      success: true,
      data: updated
    })

  } catch (error) {
    console.error('Error updating FAQ submission:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la pregunta' },
      { status: 500 }
    )
  }
}

// Delete a FAQ submission
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check admin authentication using admin-token
    const adminPayload = await getAdminUser(request)
    if (!adminPayload) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await prisma.faqSubmission.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Pregunta eliminada'
    })

  } catch (error) {
    console.error('Error deleting FAQ submission:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la pregunta' },
      { status: 500 }
    )
  }
}
