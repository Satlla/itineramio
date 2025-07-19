import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { requireAuth } from '../../../src/lib/auth'

// GET /api/notifications - Get all notifications for authenticated user
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Check if notification table exists first
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100 // Limit to last 100 notifications
      })

      return NextResponse.json({
        success: true,
        data: notifications
      })
    } catch (dbError) {
      console.error('Database error (notification table might not exist):', dbError)
      
      // Return empty array if table doesn't exist
      return NextResponse.json({
        success: true,
        data: [],
        warning: 'Notification table not available'
      })
    }

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Error al obtener notificaciones', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()
    const { notificationIds } = body

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'IDs de notificaciones requeridos' },
        { status: 400 }
      )
    }

    // Mark notifications as read
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId // Ensure user owns the notifications
      },
      data: { read: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Notificaciones marcadas como leídas'
    })

  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      { error: 'Error al actualizar notificaciones' },
      { status: 500 }
    )
  }
}