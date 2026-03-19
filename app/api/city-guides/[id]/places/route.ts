import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '../../../../../src/lib/prisma'
import { getAuthUser } from '../../../../../src/lib/auth'
import { getAdminUser } from '../../../../../src/lib/admin-auth'

const ADMIN_EMAIL = 'alejandrosatlla@gmail.com'

const CATEGORY_NAMES: Record<string, { es: string; en: string; fr: string; icon: string }> = {
  restaurant: { es: 'Restaurantes', en: 'Restaurants', fr: 'Restaurants', icon: 'Utensils' },
  cafe: { es: 'Cafeterías', en: 'Cafes', fr: 'Cafés', icon: 'Coffee' },
  tourist_attraction: { es: 'Lugares de interés', en: 'Tourist Attractions', fr: 'Attractions touristiques', icon: 'Camera' },
  park: { es: 'Parques y naturaleza', en: 'Parks & Nature', fr: 'Parcs & Nature', icon: 'Trees' },
  beach: { es: 'Playas', en: 'Beaches', fr: 'Plages', icon: 'Waves' },
  shopping_mall: { es: 'Compras', en: 'Shopping', fr: 'Shopping', icon: 'ShoppingBag' },
  museum: { es: 'Museos', en: 'Museums', fr: 'Musées', icon: 'Landmark' },
  bar: { es: 'Bares', en: 'Bars', fr: 'Bars', icon: 'Wine' },
  pharmacy: { es: 'Farmacias', en: 'Pharmacies', fr: 'Pharmacies', icon: 'Pill' },
  hospital: { es: 'Hospitales', en: 'Hospitals', fr: 'Hôpitaux', icon: 'Hospital' },
  supermarket: { es: 'Supermercados', en: 'Supermarkets', fr: 'Supermarchés', icon: 'ShoppingCart' },
  gym: { es: 'Gimnasios', en: 'Gyms', fr: 'Salles de sport', icon: 'Dumbbell' },
}

async function autoImportPlaceToProperty(
  propertyId: string,
  placeId: string,
  category: string,
  description: string | null,
  place: { latitude: number; longitude: number }
): Promise<void> {
  const catInfo = CATEGORY_NAMES[category] || { es: category, en: category, fr: category, icon: 'MapPin' }

  // Find or create RECOMMENDATIONS zone for this category
  let zone = await prisma.zone.findFirst({
    where: { propertyId, type: 'RECOMMENDATIONS', recommendationCategory: category },
  })

  if (!zone) {
    const maxZoneOrder = await prisma.zone.aggregate({
      where: { propertyId },
      _max: { order: true },
    })
    zone = await prisma.zone.create({
      data: {
        propertyId,
        name: { es: catInfo.es, en: catInfo.en, fr: catInfo.fr },
        icon: catInfo.icon,
        type: 'RECOMMENDATIONS',
        recommendationCategory: category,
        qrCode: `qr_${crypto.randomUUID()}`,
        accessCode: crypto.randomUUID().slice(0, 8).toUpperCase(),
        order: (maxZoneOrder._max.order ?? -1) + 1,
        status: 'ACTIVE',
        isPublished: true,
      },
    })
  }

  const maxOrder = await prisma.recommendation.aggregate({
    where: { zoneId: zone.id },
    _max: { order: true },
  })

  await prisma.recommendation.create({
    data: {
      zoneId: zone.id,
      placeId,
      source: 'CITY_GUIDE',
      distanceMeters: null,
      walkMinutes: null,
      order: (maxOrder._max.order ?? -1) + 1,
      description: description || null,
    },
  }).catch((err: unknown) => {
    // Skip duplicate (place already in this zone)
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') return
    throw err
  })
}

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
      select: { id: true, authorId: true, version: true, city: true },
    })

    if (!guide) {
      return NextResponse.json({ success: false, error: 'Guía no encontrada' }, { status: 404 })
    }

    const isAdmin = !!adminUser || user?.email === ADMIN_EMAIL
    if (!isAdmin && guide.authorId !== user?.userId) {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const { placeId, category, description, highlight, externalUrl, tags, order } = body

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
          highlight: highlight || null,
          externalUrl: externalUrl || null,
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

    // Auto-subscribe + import to all properties in the same city.
    // Fire-and-forget: response is returned immediately, propagation runs in background.
    const propagate = async () => {
      try {
        const propertiesInCity = await prisma.property.findMany({
          where: {
            city: { equals: guide.city, mode: 'insensitive' },
            deletedAt: null,
          },
          select: { id: true, hostId: true },
        })

        await Promise.allSettled(propertiesInCity.map(async (property) => {
          const existingSub = await prisma.propertyGuideSubscription.findUnique({
            where: { guideId_propertyId: { guideId: id, propertyId: property.id } },
            select: { status: true },
          })

          if (existingSub?.status === 'UNSUBSCRIBED') return

          if (!existingSub) {
            await prisma.propertyGuideSubscription.create({
              data: {
                guideId: id,
                propertyId: property.id,
                userId: property.hostId,
                status: 'ACTIVE',
                lastSeenVersion: guide.version,
              },
            }).catch(() => {/* ignore race condition duplicates */})
          }

          await autoImportPlaceToProperty(
            property.id,
            placeId,
            category,
            description || null,
            { latitude: place.latitude, longitude: place.longitude }
          )
        }))
      } catch (err) {
        console.error('[city-guide] Background propagation failed:', err)
      }
    }

    propagate()

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
