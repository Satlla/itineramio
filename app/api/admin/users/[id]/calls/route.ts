import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { getAdminUser } from '../../../../../../src/lib/admin-auth'

// GET /api/admin/users/[id]/calls - Get all calls for a user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = (await params).id

    // Check admin authentication
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Get calls for this user
    const calls = await prisma.callLog.findMany({
      where: { userId },
      include: {
        admin: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: calls
    })

  } catch (error) {
    console.error('Error fetching user calls:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener las llamadas del usuario' 
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/users/[id]/calls - Create a new call log
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = (await params).id
    const body = await request.json()

    // Check admin authentication
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const {
      type, // 'INCOMING', 'OUTGOING'
      duration, // duration in minutes
      reason,
      resolution,
      notes,
      followUpRequired = false,
      followUpDate = null
    } = body

    // Validate required fields
    if (!type || !reason) {
      return NextResponse.json(
        { error: 'Tipo de llamada y motivo son requeridos' },
        { status: 400 }
      )
    }

    // Create call log
    const callLog = await prisma.callLog.create({
      data: {
        userId,
        adminId: admin.adminId,
        type,
        duration: duration ? parseInt(duration) : null,
        reason,
        resolution,
        notes,
        followUpRequired,
        followUpDate: followUpDate ? new Date(followUpDate) : null
      },
      include: {
        admin: {
          select: {
            name: true,
            email: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: callLog
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating call log:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al registrar la llamada' 
      },
      { status: 500 }
    )
  }
}