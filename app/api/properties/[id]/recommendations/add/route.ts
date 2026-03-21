import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../../../../src/lib/auth'
import { prisma } from '../../../../../../src/lib/prisma'
import { getCategoryById, CATEGORIES } from '../../../../../../src/lib/recommendations/categories'
import crypto from 'crypto'

/**
 * POST /api/properties/[id]/recommendations/add
 * Unified endpoint: creates/reuses Place, creates/reuses Zone, adds Recommendation.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult
    const userId = authResult.userId

    const property = await prisma.property.findFirst({
      where: { id, hostId: userId, deletedAt: null },
      select: { id: true },
    })
    if (!property) {
      return NextResponse.json({ success: false, error: 'Propiedad no encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const { googlePlaceId, name, address, lat, lng, rating, photoUrl, types, categoryId, propertyLat, propertyLng, description, highlight, externalUrl, tags } = body

    if (!name || !address || lat == null || lng == null || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos (name, address, lat, lng, categoryId)' },
        { status: 400 }
      )
    }

    const category = getCategoryById(categoryId)
    if (!category) {
      return NextResponse.json({ success: false, error: 'Categoría no válida' }, { status: 400 })
    }

    // 1. Create or reuse Place (by googlePlaceId)
    let place = googlePlaceId
      ? await prisma.place.findUnique({ where: { placeId: googlePlaceId } })
      : null

    if (!place) {
      place = await prisma.place.create({
        data: {
          placeId: googlePlaceId || null,
          source: 'GOOGLE',
          name,
          address,
          latitude: lat,
          longitude: lng,
          rating: rating || null,
          photoUrl: photoUrl || null,
          types: types || null,
          lastFetchedAt: new Date(),
        },
      })
    }

    // 2. Find or create RECOMMENDATIONS zone for this category
    let zone = await prisma.zone.findFirst({
      where: {
        propertyId: id,
        type: 'RECOMMENDATIONS',
        recommendationCategory: categoryId,
      },
    })

    let zoneCreated = false
    if (!zone) {
      // Get next order for zones in this property
      const maxZoneOrder = await prisma.zone.aggregate({
        where: { propertyId: id },
        _max: { order: true },
      })

      zone = await prisma.zone.create({
        data: {
          propertyId: id,
          name: { es: category.label, en: category.label },
          icon: category.icon,
          type: 'RECOMMENDATIONS',
          recommendationCategory: categoryId,
          qrCode: `qr_${crypto.randomUUID()}`,
          accessCode: crypto.randomUUID().slice(0, 8).toUpperCase(),
          order: (maxZoneOrder._max.order ?? -1) + 1,
          status: 'ACTIVE',
          isPublished: true,
        },
      })
      zoneCreated = true
    }

    // 3. Check duplicate recommendation — if exists, return it as success (idempotent)
    const existing = await prisma.recommendation.findUnique({
      where: { zoneId_placeId: { zoneId: zone.id, placeId: place.id } },
      include: { place: true },
    })
    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        data: {
          recommendation: existing,
          zone: { id: zone.id, name: zone.name, icon: zone.icon, recommendationCategory: zone.recommendationCategory },
          zoneCreated: false,
        },
      }, { status: 200 })
    }

    // 4. Calculate distance
    let distanceMeters: number | null = null
    let walkMinutes: number | null = null
    if (propertyLat != null && propertyLng != null) {
      distanceMeters = Math.round(haversineDistance(propertyLat, propertyLng, lat, lng))
      walkMinutes = Math.round(distanceMeters / 80)
    }

    // 5. Next order within zone
    const maxOrder = await prisma.recommendation.aggregate({
      where: { zoneId: zone.id },
      _max: { order: true },
    })

    const recommendation = await prisma.recommendation.create({
      data: {
        zoneId: zone.id,
        placeId: place.id,
        source: 'MANUAL',
        description: description || null,
        highlight: highlight || null,
        externalUrl: externalUrl || null,
        tags: tags || null,
        distanceMeters,
        walkMinutes,
        order: (maxOrder._max.order ?? -1) + 1,
      },
      include: { place: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        recommendation,
        zone: {
          id: zone.id,
          name: zone.name,
          icon: zone.icon,
          recommendationCategory: zone.recommendationCategory,
        },
        zoneCreated,
      },
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error al añadir recomendación' }, { status: 500 })
  }
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
