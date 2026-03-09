import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { getAuthUser } from '../../../../src/lib/auth'

const ADMIN_EMAIL = 'alejandrosatlla@gmail.com'

// GET /api/city-guides/[id]
// Get single guide with all places grouped by category. No auth required.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const guide = await prisma.cityGuide.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        places: {
          include: {
            place: {
              select: {
                id: true,
                name: true,
                address: true,
                photoUrl: true,
                rating: true,
                latitude: true,
                longitude: true,
                types: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        _count: { select: { places: true, subscriptions: true } },
      },
    })

    if (!guide) {
      return NextResponse.json({ success: false, error: 'Guía no encontrada' }, { status: 404 })
    }

    // Group places by category
    const placesByCategory: Record<string, unknown[]> = {}
    for (const guidePlace of guide.places) {
      const cat = guidePlace.category
      if (!placesByCategory[cat]) placesByCategory[cat] = []
      placesByCategory[cat].push({
        id: guidePlace.id,
        category: guidePlace.category,
        description: guidePlace.description,
        addedInVersion: guidePlace.addedInVersion,
        order: guidePlace.order,
        place: guidePlace.place,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: guide.id,
        title: guide.title,
        description: guide.description,
        city: guide.city,
        country: guide.country,
        coverImage: guide.coverImage,
        status: guide.status,
        version: guide.version,
        subscriberCount: guide.subscriberCount,
        author: guide.author,
        _count: guide._count,
        placesByCategory,
      },
    })
  } catch (error) {
    console.error('Error fetching city guide:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PATCH /api/city-guides/[id]
// Update guide. Auth required. Only author or admin.
// Body: { title?, description?, coverImage?, status? }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const guide = await prisma.cityGuide.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    })

    if (!guide) {
      return NextResponse.json({ success: false, error: 'Guía no encontrada' }, { status: 404 })
    }

    const isAdmin = user.email === ADMIN_EMAIL
    if (guide.authorId !== user.userId && !isAdmin) {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, coverImage, status } = body

    const validStatuses = ['DRAFT', 'PUBLISHED', 'VERIFIED', 'SUSPENDED']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Estado no válido' }, { status: 400 })
    }

    const updated = await prisma.cityGuide.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(coverImage !== undefined && { coverImage }),
        ...(status !== undefined && { status }),
      },
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { places: true } },
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating city guide:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/city-guides/[id]
// Delete guide. Auth required. Only author or admin.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const guide = await prisma.cityGuide.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    })

    if (!guide) {
      return NextResponse.json({ success: false, error: 'Guía no encontrada' }, { status: 404 })
    }

    const isAdmin = user.email === ADMIN_EMAIL
    if (guide.authorId !== user.userId && !isAdmin) {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 })
    }

    await prisma.cityGuide.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Guía eliminada correctamente' })
  } catch (error) {
    console.error('Error deleting city guide:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
