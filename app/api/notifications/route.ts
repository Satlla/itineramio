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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const readParam = searchParams.get('read')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Build where clause
    const where: any = { userId }
    if (type) {
      where.type = type
    }
    if (readParam !== null) {
      where.read = readParam === 'true'
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return NextResponse.json({
      success: true,
      notifications,
      count: notifications.length
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Error al obtener notificaciones', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Create a new notification (internal use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, title, message, data } = body

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data || {}
      }
    })

    return NextResponse.json({
      success: true,
      data: notification
    })

  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Error creating notification' },
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
    const { notificationIds, markAllAsRead } = body

    if (markAllAsRead) {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: {
          userId,
          read: false
        },
        data: { read: true }
      })

      return NextResponse.json({
        success: true,
        message: 'Todas las notificaciones marcadas como leídas'
      })
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'IDs de notificaciones requeridos' },
        { status: 400 }
      )
    }

    // Mark specific notifications as read
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