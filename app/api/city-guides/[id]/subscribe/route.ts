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

async function importPlacesToProperty(
  propertyId: string,
  places: Array<{
    placeId: string
    category: string
    description: string | null
    place: {
      id: string
      latitude: number
      longitude: number
    }
  }>,
  propertyLat: number | null,
  propertyLng: number | null
): Promise<number> {
  let importedCount = 0

  for (const guidePlace of places) {
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
      // Skip unique constraint violations (duplicate place already in zone)
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

// POST /api/city-guides/[id]/subscribe
// Subscribe a property to a guide. Auth required.
// Body: { propertyId }
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
    const { propertyId } = body

    if (!propertyId) {
      return NextResponse.json({ success: false, error: 'El campo propertyId es obligatorio' }, { status: 400 })
    }

    // Verify guide exists
    const guide = await prisma.cityGuide.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        places: {
          include: {
            place: {
              select: { id: true, latitude: true, longitude: true },
            },
          },
        },
      },
    })

    if (!guide) {
      return NextResponse.json({ success: false, error: 'Guía no encontrada' }, { status: 404 })
    }

    // Verify property ownership
    // Note: Property model does not have latitude/longitude columns directly;
    // distance calculation will be skipped (null coordinates).
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { hostId: true },
    })

    if (!property) {
      return NextResponse.json({ success: false, error: 'Propiedad no encontrada' }, { status: 404 })
    }

    if (property.hostId !== user.userId) {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 })
    }

    // Create subscription (or error if already exists)
    let subscription
    try {
      subscription = await prisma.propertyGuideSubscription.create({
        data: {
          guideId: id,
          propertyId,
          userId: user.userId,
          status: 'ACTIVE',
          lastSeenVersion: 1,
        },
      })
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        return NextResponse.json(
          { success: false, error: 'Esta propiedad ya está suscrita a esta guía' },
          { status: 409 }
        )
      }
      throw err
    }

    // Import all current guide places into property recommendation zones
    // Property does not store lat/lng directly — pass null (distance will be skipped)
    const importedCount = await importPlacesToProperty(
      propertyId,
      guide.places.map((gp) => ({
        placeId: gp.placeId,
        category: gp.category,
        description: gp.description,
        place: gp.place,
      })),
      null,
      null
    )

    // Increment subscriberCount
    await prisma.cityGuide.update({
      where: { id },
      data: { subscriberCount: { increment: 1 } },
    })

    return NextResponse.json(
      { success: true, data: { subscription, importedCount } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error subscribing to city guide:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/city-guides/[id]/subscribe
// Unsubscribe a property. Auth required.
// Body: { propertyId }
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

    const body = await request.json()
    const { propertyId } = body

    if (!propertyId) {
      return NextResponse.json({ success: false, error: 'El campo propertyId es obligatorio' }, { status: 400 })
    }

    // Verify property ownership
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { hostId: true },
    })

    if (!property) {
      return NextResponse.json({ success: false, error: 'Propiedad no encontrada' }, { status: 404 })
    }

    if (property.hostId !== user.userId) {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 })
    }

    const subscription = await prisma.propertyGuideSubscription.findUnique({
      where: { guideId_propertyId: { guideId: id, propertyId } },
    })

    if (!subscription) {
      return NextResponse.json({ success: false, error: 'Suscripción no encontrada' }, { status: 404 })
    }

    // Set status to UNSUBSCRIBED — do NOT remove already-copied recommendations
    await prisma.propertyGuideSubscription.update({
      where: { guideId_propertyId: { guideId: id, propertyId } },
      data: { status: 'UNSUBSCRIBED' },
    })

    return NextResponse.json({ success: true, message: 'Suscripción cancelada correctamente' })
  } catch (error) {
    console.error('Error unsubscribing from city guide:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
