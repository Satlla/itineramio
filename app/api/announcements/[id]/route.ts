import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { requireAuth } from '../../../../src/lib/auth'

// PUT /api/announcements/[id] - Update announcement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🚀 PUT /api/announcements/[id] - Starting...')
  
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      console.log('❌ Auth failed')
      return authResult
    }
    const userId = authResult.userId
    console.log('✅ Auth success, userId:', userId)

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

    // Build update data object
    const updateData: any = {}
    
    if (title !== undefined) updateData.title = title
    if (message !== undefined) updateData.message = message
    if (category !== undefined) updateData.category = category
    if (priority !== undefined) updateData.priority = priority
    if (isActive !== undefined) updateData.isActive = isActive
    
    // Handle dates carefully - allow null to clear dates
    if (startDate !== undefined) {
      updateData.startDate = startDate && startDate.trim() ? new Date(startDate) : null
    }
    if (endDate !== undefined) {
      updateData.endDate = endDate && endDate.trim() ? new Date(endDate) : null
    }
    
    // Update announcement
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: updateData
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
  console.log('🚀 DELETE /api/announcements/[id] - Starting...')
  
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      console.log('❌ Auth failed')
      return authResult
    }
    const userId = authResult.userId
    console.log('✅ Auth success, userId:', userId)

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

// OPTIONS for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}