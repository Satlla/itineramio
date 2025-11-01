import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = 'itineramio-secret-key-2024'

interface UserInspirationState {
  userId: string
  dismissedZones: string[]
  createdZones: string[]
  lastShownInspiration?: string
  showInspirations: boolean
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify JWT token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const { userId } = await params

    // Set JWT claims for PostgreSQL RLS policies
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead

    // Verify the user is accessing their own data
    if (decoded.userId !== userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Try to get existing inspiration state
    let inspirationState = await prisma.userInspirationState.findUnique({
      where: { userId }
    })

    // If no state exists, create default state
    if (!inspirationState) {
      inspirationState = await prisma.userInspirationState.create({
        data: {
          userId,
          dismissedZones: [],
          createdZones: [],
          showInspirations: true
        }
      })
    }

    const responseState: UserInspirationState = {
      userId: inspirationState.userId,
      dismissedZones: inspirationState.dismissedZones as string[],
      createdZones: inspirationState.createdZones as string[],
      lastShownInspiration: inspirationState.lastShownInspiration || undefined,
      showInspirations: inspirationState.showInspirations
    }

    return NextResponse.json({
      success: true,
      data: responseState
    })

  } catch (error) {
    console.error('Error fetching inspiration state:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify JWT token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const { userId } = await params

    // Set JWT claims for PostgreSQL RLS policies
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead

    // Verify the user is updating their own data
    if (decoded.userId !== userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const state: UserInspirationState = body

    // Validate the state structure
    if (!Array.isArray(state.dismissedZones) || !Array.isArray(state.createdZones)) {
      return NextResponse.json({
        error: 'Formato de datos inválido'
      }, { status: 400 })
    }

    // Update or create the inspiration state
    const updatedState = await prisma.userInspirationState.upsert({
      where: { userId },
      update: {
        dismissedZones: state.dismissedZones,
        createdZones: state.createdZones,
        lastShownInspiration: state.lastShownInspiration,
        showInspirations: state.showInspirations,
        updatedAt: new Date()
      },
      create: {
        userId,
        dismissedZones: state.dismissedZones,
        createdZones: state.createdZones,
        lastShownInspiration: state.lastShownInspiration,
        showInspirations: state.showInspirations
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        userId: updatedState.userId,
        dismissedZones: updatedState.dismissedZones as string[],
        createdZones: updatedState.createdZones as string[],
        lastShownInspiration: updatedState.lastShownInspiration || undefined,
        showInspirations: updatedState.showInspirations
      }
    })

  } catch (error) {
    console.error('Error updating inspiration state:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}