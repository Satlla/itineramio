import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'itineramio-secret-key-2024'

// Update a FAQ submission (answer, change status, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let userId: string
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      userId = decoded.userId
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true, name: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

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
        ...(answer && !status && { status: 'ANSWERED', answeredAt: new Date(), answeredBy: user.name || userId })
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

    // Check admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let userId: string
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      userId = decoded.userId
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
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
