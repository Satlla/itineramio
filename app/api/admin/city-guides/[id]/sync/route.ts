import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../../../src/lib/admin-auth'

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

async function syncPlaceToProperty(
  propertyId: string,
  placeId: string,
  category: string,
  description: string | null,
): Promise<boolean> {
  const catInfo = CATEGORY_NAMES[category] || { es: category, en: category, fr: category, icon: 'MapPin' }

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

  try {
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
    })
    return true
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') {
      return false // already exists
    }
    throw err
  }
}

// POST /api/admin/city-guides/[id]/sync
// Syncs all guide places to all subscribed (or auto-subscribable) properties in the city.
// Only imports places that the property doesn't already have. Safe to run multiple times.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) return authResult

    const { id } = await params

    const guide = await prisma.cityGuide.findUnique({
      where: { id },
      select: {
        id: true,
        city: true,
        version: true,
        places: {
          select: {
            placeId: true,
            category: true,
            description: true,
          },
        },
      },
    })

    if (!guide) {
      return NextResponse.json({ success: false, error: 'Guía no encontrada' }, { status: 404 })
    }

    if (guide.places.length === 0) {
      return NextResponse.json({ success: true, data: { synced: 0, properties: 0 } })
    }

    const propertiesInCity = await prisma.property.findMany({
      where: {
        city: { equals: guide.city, mode: 'insensitive' },
        deletedAt: null,
      },
      select: { id: true, hostId: true },
    })

    let totalSynced = 0
    let propertiesAffected = 0

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
        }).catch(() => {/* ignore duplicates */})
      }

      let propertySynced = 0
      for (const guidePlace of guide.places) {
        const imported = await syncPlaceToProperty(
          property.id,
          guidePlace.placeId,
          guidePlace.category,
          guidePlace.description,
        )
        if (imported) propertySynced++
      }

      if (propertySynced > 0) {
        totalSynced += propertySynced
        propertiesAffected++
      }
    }))

    return NextResponse.json({
      success: true,
      data: {
        synced: totalSynced,
        properties: propertiesAffected,
        total: propertiesInCity.length,
      },
    })
  } catch (error) {
    console.error('[sync] City guide sync failed:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
