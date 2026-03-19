import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../../../src/lib/admin-auth'

// GET /api/admin/city-guides/[id]/popular-places
// Returns places frequently added manually by users in properties of the same city,
// that are NOT already in this guide. Sorted by adoption count desc.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) return authResult

    const { id } = await params
    const minCount = parseInt(request.nextUrl.searchParams.get('minCount') ?? '2')

    const guide = await prisma.cityGuide.findUnique({
      where: { id },
      select: { city: true, places: { select: { placeId: true } } },
    })

    if (!guide) {
      return NextResponse.json({ success: false, error: 'Guía no encontrada' }, { status: 404 })
    }

    const alreadyInGuide = new Set(guide.places.map((p) => p.placeId))

    // Find all properties in the same city
    const propertiesInCity = await prisma.property.findMany({
      where: { city: { equals: guide.city, mode: 'insensitive' }, deletedAt: null },
      select: { id: true },
    })

    if (propertiesInCity.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const propertyIds = propertiesInCity.map((p) => p.id)

    // Count how many properties have each place added manually
    const recommendations = await prisma.recommendation.findMany({
      where: {
        source: 'MANUAL',
        placeId: { not: null },
        zone: { propertyId: { in: propertyIds } },
      },
      select: {
        placeId: true,
        zone: { select: { recommendationCategory: true } },
      },
    })

    // Count per placeId
    const counts: Record<string, { count: number; category: string }> = {}
    for (const rec of recommendations) {
      if (!rec.placeId) continue
      if (alreadyInGuide.has(rec.placeId)) continue
      if (!counts[rec.placeId]) {
        counts[rec.placeId] = { count: 0, category: rec.zone.recommendationCategory ?? '' }
      }
      counts[rec.placeId].count++
    }

    // Filter by minimum count and sort desc
    const popular = Object.entries(counts)
      .filter(([, v]) => v.count >= minCount)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 50)

    if (popular.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    // Fetch place details
    const places = await prisma.place.findMany({
      where: { id: { in: popular.map(([pid]) => pid) } },
      select: {
        id: true,
        name: true,
        address: true,
        rating: true,
        photoUrl: true,
        latitude: true,
        longitude: true,
        types: true,
      },
    })

    const placeMap = new Map(places.map((p) => [p.id, p]))

    const result = popular
      .map(([placeId, { count, category }]) => ({
        placeId,
        count,
        category,
        place: placeMap.get(placeId) ?? null,
      }))
      .filter((r) => r.place !== null)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error fetching popular places:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
