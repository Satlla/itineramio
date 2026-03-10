import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { getAuthUser } from '../../../../../src/lib/auth'
import { getAdminUser } from '../../../../../src/lib/admin-auth'

const ADMIN_EMAIL = 'alejandrosatlla@gmail.com'

// POST /api/city-guides/[id]/places
// Add a place to the guide. Auth required, only author or admin.
// Body: { placeId, category, description?, order? }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await getAuthUser(request)
    const adminUser = await getAdminUser(request)
    if (!user && !adminUser) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const guide = await prisma.cityGuide.findUnique({
      where: { id },
      select: { id: true, authorId: true, version: true },
    })

    if (!guide) {
      return NextResponse.json({ success: false, error: 'Guía no encontrada' }, { status: 404 })
    }

    const isAdmin = !!adminUser || user?.email === ADMIN_EMAIL
    if (!isAdmin && guide.authorId !== user?.userId) {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const { placeId, category, description, mustTry, bookingUrl, tags, order } = body

    if (!placeId || !category) {
      return NextResponse.json(
        { success: false, error: 'Los campos placeId y category son obligatorios' },
        { status: 400 }
      )
    }

    // Verify place exists
    const place = await prisma.place.findUnique({ where: { id: placeId } })
    if (!place) {
      return NextResponse.json({ success: false, error: 'Place no encontrado' }, { status: 404 })
    }

    // Determine order within category if not provided
    let nextOrder = order
    if (nextOrder == null) {
      const maxOrder = await prisma.cityGuidePlace.aggregate({
        where: { guideId: id, category },
        _max: { order: true },
      })
      nextOrder = (maxOrder._max.order ?? -1) + 1
    }

    const newVersion = guide.version + 1

    // Create place entry and bump version atomically
    const [guidePlace] = await prisma.$transaction([
      prisma.cityGuidePlace.create({
        data: {
          guideId: id,
          placeId,
          category,
          description: description || null,
          mustTry: mustTry || null,
          bookingUrl: bookingUrl || null,
          tags: tags || [],
          order: nextOrder,
          addedInVersion: newVersion,
        },
        include: {
          place: {
            select: {
              id: true,
              name: true,
              address: true,
              photoUrl: true,
              photoUrls: true,
              rating: true,
              priceLevel: true,
              latitude: true,
              longitude: true,
              types: true,
            },
          },
        },
      }),
      prisma.cityGuide.update({
        where: { id },
        data: { version: newVersion },
      }),
    ])

    // Create CityGuideUpdate record
    const guideUpdate = await prisma.cityGuideUpdate.create({
      data: {
        guideId: id,
        version: newVersion,
        addedPlaceIds: [placeId],
        summary: `Added place in category ${category}`,
      },
    })

    // Send GuideUpdateNotification to all ACTIVE subscribers
    const subscriptions = await prisma.propertyGuideSubscription.findMany({
      where: { guideId: id, status: 'ACTIVE' },
      select: { id: true },
    })

    if (subscriptions.length > 0) {
      await prisma.guideUpdateNotification.createMany({
        data: subscriptions.map((sub) => ({
          subscriptionId: sub.id,
          updateId: guideUpdate.id,
          status: 'PENDING',
        })),
        skipDuplicates: true,
      })
    }

    return NextResponse.json({ success: true, data: guidePlace }, { status: 201 })
  } catch (error) {
    console.error('Error adding place to city guide:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/city-guides/[id]/places
// Remove a place. Auth required, only author or admin.
// Body: { placeId }
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await getAuthUser(request)
    const adminUser = await getAdminUser(request)
    if (!user && !adminUser) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const guide = await prisma.cityGuide.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    })

    if (!guide) {
      return NextResponse.json({ success: false, error: 'Guía no encontrada' }, { status: 404 })
    }

    const isAdmin = !!adminUser || user?.email === ADMIN_EMAIL
    if (!isAdmin && guide.authorId !== user?.userId) {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const { placeId } = body

    if (!placeId) {
      return NextResponse.json({ success: false, error: 'El campo placeId es obligatorio' }, { status: 400 })
    }

    const guidePlace = await prisma.cityGuidePlace.findUnique({
      where: { guideId_placeId: { guideId: id, placeId } },
    })

    if (!guidePlace) {
      return NextResponse.json({ success: false, error: 'El lugar no está en esta guía' }, { status: 404 })
    }

    await prisma.cityGuidePlace.delete({
      where: { guideId_placeId: { guideId: id, placeId } },
    })

    return NextResponse.json({ success: true, message: 'Lugar eliminado de la guía' })
  } catch (error) {
    console.error('Error removing place from city guide:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
