import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { getAdminUser } from '../../../../../../src/lib/admin-auth'

// GET /api/admin/users/[id]/notes - Get all notes for a user
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

    // Get notes for this user
    const notes = await prisma.userNote.findMany({
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
      data: notes
    })

  } catch (error) {
    console.error('Error fetching user notes:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener las notas del usuario' 
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/users/[id]/notes - Create a new user note
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
      type, // 'GENERAL', 'BEHAVIOR', 'TECHNICAL', 'BILLING', 'COMPLAINT', 'COMPLIMENT'
      priority, // 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
      title,
      content,
      isPrivate = false,
      tags = []
    } = body

    // Validate required fields
    if (!type || !title || !content) {
      return NextResponse.json(
        { error: 'Tipo, título y contenido son requeridos' },
        { status: 400 }
      )
    }

    // Create user note
    const userNote = await prisma.userNote.create({
      data: {
        userId,
        adminId: admin.adminId,
        type,
        priority: priority || 'MEDIUM',
        title,
        content,
        isPrivate,
        tags: tags.length > 0 ? tags : []
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
      data: userNote
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating user note:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al crear la nota del usuario' 
      },
      { status: 500 }
    )
  }
}