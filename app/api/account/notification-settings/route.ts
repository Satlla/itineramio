import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { requireAuth } from '../../../../src/lib/auth'

// GET /api/account/notification-settings - Get user notification preferences
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // For now, we'll store preferences in a JSON field
    // In the future, this could be a separate table
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        notificationPreferences: true
      }
    })

    // Default preferences if none exist
    const defaultPreferences = {
      emailNotifications: {
        evaluations: true,
        propertyUpdates: true,
        weeklyReports: false,
        marketing: false
      },
      pushNotifications: {
        enabled: false,
        evaluations: true,
        propertyUpdates: true
      }
    }

    return NextResponse.json({
      success: true,
      data: user?.notificationPreferences || defaultPreferences
    })

  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración de notificaciones' },
      { status: 500 }
    )
  }
}

// PUT /api/account/notification-settings - Update user notification preferences
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()
    const { emailNotifications, pushNotifications } = body

    // Validate the structure
    if (!emailNotifications || typeof emailNotifications !== 'object') {
      return NextResponse.json(
        { error: 'Configuración inválida' },
        { status: 400 }
      )
    }

    // Update user preferences
    await prisma.user.update({
      where: { id: userId },
      data: {
        notificationPreferences: {
          emailNotifications,
          pushNotifications: pushNotifications || { enabled: false }
        }
      }
    })

    // Also update in-memory cache for immediate effect
    // This helps with the email sending logic
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `user-${userId}-notificationSettings`,
        JSON.stringify({ emailNotifications, pushNotifications })
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración actualizada correctamente'
    })

  } catch (error) {
    console.error('Error updating notification settings:', error)
    return NextResponse.json(
      { error: 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}