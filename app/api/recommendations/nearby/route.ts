import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../../src/lib/auth'
import { prisma } from '../../../../src/lib/prisma'
import { checkRateLimitAsync } from '../../../../src/lib/rate-limit'

function proxyPhotoUrl(photoUrl: string | null | undefined): string | null {
  if (!photoUrl) return null
  if (!photoUrl.startsWith('https://maps.googleapis.com/maps/api/place/photo')) return photoUrl
  return `/api/public/place-photo?url=${encodeURIComponent(photoUrl)}`
}

/**
 * GET /api/recommendations/nearby?city=Alicante
 * Returns places recommended by OTHER hosts in the same city.
 * Groups by place to avoid duplicates and counts how many hosts recommend each.
 * Does NOT expose any host/property data (privacy).
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult
    const userId = authResult.userId as string

    const { allowed } = await checkRateLimitAsync(`nearby-recs:${userId}`, { maxRequests: 20, windowMs: 60_000 })
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const excludePropertyId = searchParams.get('excludePropertyId')

    if (!city) {
      return NextResponse.json({ error: 'Se requiere el parametro city' }, { status: 400 })
    }

    // Find recommendations from OTHER users' properties in the same city
    // Join: Recommendation -> Zone -> Property (city match, not user's property)
    // Group by Place to get popularity count
    const nearbyRecs = await prisma.recommendation.findMany({
      where: {
        placeId: { not: null },
        zone: {
          property: {
            city: { equals: city, mode: 'insensitive' },
            hostId: { not: userId },
            deletedAt: null,
          },
        },
      },
      select: {
        placeId: true,
        place: {
          select: {
            id: true,
            placeId: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
            rating: true,
            photoUrl: true,
            types: true,
            source: true,
          },
        },
        zone: {
          select: {
            recommendationCategory: true,
            propertyId: true,
          },
        },
      },
    })

    // Group by placeId and count unique properties that recommend each place
    const placeMap = new Map<string, {
      place: typeof nearbyRecs[0]['place']
      category: string
      propertyIds: Set<string>
    }>()

    for (const rec of nearbyRecs) {
      if (!rec.placeId || !rec.place) continue
      const existing = placeMap.get(rec.placeId)
      if (existing) {
        existing.propertyIds.add(rec.zone.propertyId ?? '')
      } else {
        placeMap.set(rec.placeId, {
          place: rec.place,
          category: rec.zone.recommendationCategory ?? 'other',
          propertyIds: new Set([rec.zone.propertyId ?? '']),
        })
      }
    }

    // If excludePropertyId is provided, also exclude places already in that property
    let excludePlaceIds: Set<string> = new Set()
    if (excludePropertyId) {
      const existingRecs = await prisma.recommendation.findMany({
        where: {
          zone: { propertyId: excludePropertyId },
          placeId: { not: null },
        },
        select: { placeId: true },
      })
      excludePlaceIds = new Set(existingRecs.map(r => r.placeId!).filter(Boolean))
    }

    // Convert to array, sort by popularity, limit to 20
    const results = Array.from(placeMap.entries())
      .filter(([placeId]) => !excludePlaceIds.has(placeId))
      .map(([, { place, category, propertyIds }]) => ({
        placeId: place!.id,
        googlePlaceId: place!.placeId,
        name: place!.name,
        address: place!.address,
        latitude: place!.latitude,
        longitude: place!.longitude,
        rating: place!.rating,
        photoUrl: proxyPhotoUrl(place!.photoUrl),
        types: place!.types,
        source: place!.source,
        category,
        hostsCount: propertyIds.size,
      }))
      .sort((a, b) => b.hostsCount - a.hostsCount)
      .slice(0, 20)

    return NextResponse.json({ success: true, data: results })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al buscar recomendaciones cercanas' },
      { status: 500 }
    )
  }
}
