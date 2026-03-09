import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '../../../../../src/lib/prisma'
import { getAuthUser } from '../../../../../src/lib/auth'

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return Math.round(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

const CATEGORY_NAMES: Record<string, { es: string; en: string; fr: string; icon: string }> = {
  restaurant: { es: 'Restaurantes', en: 'Restaurants', fr: 'Restaurants', icon: 'Utensils' },
  cafe: { es: 'Cafeterías', en: 'Cafes', fr: 'Cafés', icon: 'Coffee' },
  tourist_attraction: {
    es: 'Lugares de interés',
    en: 'Tourist Attractions',
    fr: 'Attractions touristiques',
    icon: 'Camera',
  },
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

async function importPlaceIdsToProperty(
  propertyId: string,
  placeIds: string[],
  guideId: string,
  propertyLat: number | null,
  propertyLng: number | null
): Promise<number> {
  if (placeIds.length === 0) return 0

  // Fetch place + guide category info for each placeId
  const guidePlaces = await prisma.cityGuidePlace.findMany({
    where: {
      guideId,
      placeId: { in: placeIds },
    },
    include: {
      place: {
        select: { id: true, latitude: true, longitude: true },
      },
    },
  })

  let importedCount = 0

  for (const guidePlace of guidePlaces) {
    const category = guidePlace.category
    const catInfo = CATEGORY_NAMES[category] || {
      es: category,
      en: category,
      fr: category,
      icon: 'MapPin',
    }

    // Find or create RECOMMENDATIONS zone for this category
    let zone = await prisma.zone.findFirst({
      where: {
        propertyId,
        type: 'RECOMMENDATIONS',
        recommendationCategory: category,
      },
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

    // Calculate distance
    let distanceMeters: number | null = null
    let walkMinutes: number | null = null
    if (propertyLat != null && propertyLng != null) {
      distanceMeters = haversineMeters(
        propertyLat,
        propertyLng,
        guidePlace.place.latitude,
        guidePlace.place.longitude
      )
      walkMinutes = Math.round(distanceMeters / 80)
    }

    // Determine next order within zone
    const maxOrder = await prisma.recommendation.aggregate({
      where: { zoneId: zone.id },
      _max: { order: true },
    })

    try {
      await prisma.recommendation.create({
        data: {
          zoneId: zone.id,
          placeId: guidePlace.placeId,
          source: 'CITY_GUIDE',
          distanceMeters,
          walkMinutes,
          order: (maxOrder._max.order ?? -1) + 1,
          description: guidePlace.description || null,
        },
      })
      importedCount++
    } catch (err: unknown) {
      // Skip unique constraint violations (duplicate already in zone)
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        continue
      }
      throw err
    }
  }

  return importedCount
}

// GET /api/city-guides/[id]/notifications
// Get pending notifications for the current user's subscriptions to this guide. Auth required.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    // Find all subscriptions for this user on this guide
    const subscriptions = await prisma.propertyGuideSubscription.findMany({
      where: {
        guideId: id,
        userId: user.userId,
        status: 'ACTIVE',
      },
      select: { id: true, propertyId: true },
    })

    if (subscriptions.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const subscriptionIds = subscriptions.map((s) => s.id)

    const notifications = await prisma.guideUpdateNotification.findMany({
      where: {
        subscriptionId: { in: subscriptionIds },
        status: 'PENDING',
      },
      include: {
        subscription: {
          select: { propertyId: true },
        },
        update: {
          select: {
            id: true,
            version: true,
            addedPlaceIds: true,
            summary: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Enrich with place details for each notification
    const enriched = await Promise.all(
      notifications.map(async (notification) => {
        const addedPlaceIds = notification.update.addedPlaceIds as string[]

        const places = await prisma.cityGuidePlace.findMany({
          where: {
            guideId: id,
            placeId: { in: addedPlaceIds },
          },
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
        })

        return {
          id: notification.id,
          status: notification.status,
          createdAt: notification.createdAt,
          propertyId: notification.subscription.propertyId,
          update: {
            id: notification.update.id,
            version: notification.update.version,
            summary: notification.update.summary,
            createdAt: notification.update.createdAt,
            addedPlaces: places.map((gp) => ({
              placeId: gp.placeId,
              category: gp.category,
              description: gp.description,
              place: gp.place,
            })),
          },
        }
      })
    )

    return NextResponse.json({ success: true, data: enriched })
  } catch (error) {
    console.error('Error fetching guide notifications:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/city-guides/[id]/notifications
// Handle a notification action. Auth required.
// Body: { notificationId, action: 'accept_all' | 'accept_partial' | 'decline', acceptedPlaceIds?: string[] }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, action, acceptedPlaceIds } = body

    if (!notificationId || !action) {
      return NextResponse.json(
        { success: false, error: 'Los campos notificationId y action son obligatorios' },
        { status: 400 }
      )
    }

    const validActions = ['accept_all', 'accept_partial', 'decline']
    if (!validActions.includes(action)) {
      return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 })
    }

    // Fetch notification with subscription and update info
    const notification = await prisma.guideUpdateNotification.findUnique({
      where: { id: notificationId },
      include: {
        subscription: {
          select: {
            id: true,
            guideId: true,
            propertyId: true,
            userId: true,
            lastSeenVersion: true,
          },
        },
        update: {
          select: {
            id: true,
            version: true,
            addedPlaceIds: true,
          },
        },
      },
    })

    if (!notification) {
      return NextResponse.json({ success: false, error: 'Notificación no encontrada' }, { status: 404 })
    }

    // Verify the notification belongs to the current user
    if (notification.subscription.userId !== user.userId) {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 })
    }

    // Verify notification is for this guide
    if (notification.subscription.guideId !== id) {
      return NextResponse.json({ success: false, error: 'Notificación no pertenece a esta guía' }, { status: 400 })
    }

    const propertyId = notification.subscription.propertyId
    const allAddedPlaceIds = notification.update.addedPlaceIds as string[]
    const toVersion = notification.update.version

    // Property model does not have latitude/longitude columns;
    // distance calculation is skipped (null coordinates).
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    })

    let importedCount = 0

    if (action === 'accept_all') {
      importedCount = await importPlaceIdsToProperty(
        propertyId,
        allAddedPlaceIds,
        id,
        null,
        null
      )

      await prisma.guideUpdateNotification.update({
        where: { id: notificationId },
        data: {
          status: 'ACCEPTED',
          acceptedIds: allAddedPlaceIds,
        },
      })
    } else if (action === 'accept_partial') {
      if (!acceptedPlaceIds || !Array.isArray(acceptedPlaceIds) || acceptedPlaceIds.length === 0) {
        return NextResponse.json(
          { success: false, error: 'acceptedPlaceIds es obligatorio para accept_partial' },
          { status: 400 }
        )
      }

      // Filter to only valid IDs from this update
      const validIds = (acceptedPlaceIds as string[]).filter((pid: string) =>
        allAddedPlaceIds.includes(pid)
      )

      importedCount = await importPlaceIdsToProperty(
        propertyId,
        validIds,
        id,
        null,
        null
      )

      await prisma.guideUpdateNotification.update({
        where: { id: notificationId },
        data: {
          status: 'PARTIAL',
          acceptedIds: validIds,
        },
      })
    } else {
      // decline
      await prisma.guideUpdateNotification.update({
        where: { id: notificationId },
        data: {
          status: 'DECLINED',
        },
      })
    }

    // Update subscription.lastSeenVersion to the update's toVersion
    if (toVersion > notification.subscription.lastSeenVersion) {
      await prisma.propertyGuideSubscription.update({
        where: { id: notification.subscription.id },
        data: { lastSeenVersion: toVersion },
      })
    }

    return NextResponse.json({
      success: true,
      data: { action, importedCount },
    })
  } catch (error) {
    console.error('Error handling guide notification:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
