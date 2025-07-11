import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../src/lib/prisma'

const JWT_SECRET = 'itineramio-secret-key-2024'

// Get notification preferences
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let userId: string
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      userId = decoded.userId
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Get user's notification preferences
    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userId }
    })

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await prisma.notificationPreferences.create({
        data: {
          userId,
          emailEvaluations: true,
          emailSuggestions: true,
          emailPropertyUpdates: true,
          emailSystemUpdates: false,
          inAppEvaluations: true,
          inAppSuggestions: true,
          inAppPropertyUpdates: true,
          inAppSystemUpdates: true
        }
      })
    }

    return NextResponse.json({
      success: true,
      preferences: {
        emailEvaluations: preferences.emailEvaluations,
        emailSuggestions: preferences.emailSuggestions,
        emailPropertyUpdates: preferences.emailPropertyUpdates,
        emailSystemUpdates: preferences.emailSystemUpdates,
        inAppEvaluations: preferences.inAppEvaluations,
        inAppSuggestions: preferences.inAppSuggestions,
        inAppPropertyUpdates: preferences.inAppPropertyUpdates,
        inAppSystemUpdates: preferences.inAppSystemUpdates
      }
    })
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener las preferencias'
    }, { status: 500 })
  }
}

// Update notification preferences
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let userId: string
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      userId = decoded.userId
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const {
      emailEvaluations,
      emailSuggestions,
      emailPropertyUpdates,
      emailSystemUpdates,
      inAppEvaluations,
      inAppSuggestions,
      inAppPropertyUpdates,
      inAppSystemUpdates
    } = await request.json()

    // Update or create preferences
    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId },
      update: {
        emailEvaluations,
        emailSuggestions,
        emailPropertyUpdates,
        emailSystemUpdates,
        inAppEvaluations,
        inAppSuggestions,
        inAppPropertyUpdates,
        inAppSystemUpdates,
        updatedAt: new Date()
      },
      create: {
        userId,
        emailEvaluations,
        emailSuggestions,
        emailPropertyUpdates,
        emailSystemUpdates,
        inAppEvaluations,
        inAppSuggestions,
        inAppPropertyUpdates,
        inAppSystemUpdates
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Preferencias guardadas correctamente',
      preferences
    })
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al guardar las preferencias'
    }, { status: 500 })
  }
}