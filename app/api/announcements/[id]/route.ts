import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { requireAuth } from '../../../../src/lib/auth'

// PUT /api/announcements/[id] - Update announcement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { id } = await params
    const body = await request.json()
    const { 
      title, 
      message, 
      category,
      priority,
      isActive,
      startDate,
      endDate
    } = body

    // Find announcement and verify ownership
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        property: {
          select: { hostId: true }
        }
      }
    })

    if (!announcement || announcement.property.hostId !== userId) {
      return NextResponse.json(
        { error: 'Aviso no encontrado' },
        { status: 404 }
      )
    }

    // Update announcement
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: {
        title: title || announcement.title,
        message: message || announcement.message,
        category: category || announcement.category,
        priority: priority || announcement.priority,
        isActive: isActive !== undefined ? isActive : announcement.isActive,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : announcement.startDate,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : announcement.endDate
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedAnnouncement,
      message: 'Aviso actualizado correctamente'
    })

  } catch (error) {
    console.error('Error updating announcement:', error)
    return NextResponse.json(
      { error: 'Error al actualizar aviso' },
      { status: 500 }
    )
  }
}

// DELETE /api/announcements/[id] - Delete announcement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { id } = await params

    // Find announcement and verify ownership
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        property: {
          select: { hostId: true }
        }
      }
    })

    if (!announcement || announcement.property.hostId !== userId) {
      return NextResponse.json(
        { error: 'Aviso no encontrado' },
        { status: 404 }
      )
    }

    // Delete announcement
    await prisma.announcement.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Aviso eliminado correctamente'
    })

  } catch (error) {
    console.error('Error deleting announcement:', error)
    return NextResponse.json(
      { error: 'Error al eliminar aviso' },
      { status: 500 }
    )
  }
}