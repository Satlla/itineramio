import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../../../../../src/lib/auth'
import { prisma } from '../../../../../../../src/lib/prisma'

function proxyPhotoUrl(photoUrl: string | null | undefined): string | null {
  if (!photoUrl) return null
  if (!photoUrl.startsWith('https://maps.googleapis.com/maps/api/place/photo')) return photoUrl
  return `/api/public/place-photo?url=${encodeURIComponent(photoUrl)}`
}

/**
 * GET /api/properties/[id]/zones/[zoneId]/recommendations
 * List recommendations for a specific zone, ordered by `order`.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  try {
    const { id, zoneId } = await params

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

    const zone = await prisma.zone.findFirst({
      where: { id: zoneId, propertyId: id, type: 'RECOMMENDATIONS' },
      select: { id: true },
    })
    if (!zone) {
      return NextResponse.json({ success: false, error: 'Zona no encontrada' }, { status: 404 })
    }

    const recs = await prisma.recommendation.findMany({
      where: { zoneId },
      include: { place: true },
      orderBy: { order: 'asc' },
    })

    const data = recs.map(rec => ({
      ...rec,
      place: rec.place ? {
        ...rec.place,
        photoUrl: proxyPhotoUrl(rec.place.photoUrl),
      } : null,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching zone recommendations:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener recomendaciones' }, { status: 500 })
  }
}

/**
 * POST /api/properties/[id]/zones/[zoneId]/recommendations
 * Add a recommendation manually.
 * Body: { placeId?: string, name?: string, address?: string, lat?: number, lng?: number, description?: string, rating?: number, photoUrl?: string, types?: string[] }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  try {
    const { id, zoneId } = await params

    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult
    const userId = authResult.userId

    const property = await prisma.property.findFirst({
      where: { id, hostId: userId, deletedAt: null },
      select: { id: true, street: true, city: true, state: true, country: true },
    })
    if (!property) {
      return NextResponse.json({ success: false, error: 'Propiedad no encontrada' }, { status: 404 })
    }

    const zone = await prisma.zone.findFirst({
      where: { id: zoneId, propertyId: id, type: 'RECOMMENDATIONS' },
      select: { id: true },
    })
    if (!zone) {
      return NextResponse.json({ success: false, error: 'Zona no encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const { placeId: existingPlaceId, name, address, lat, lng, description, highlight, externalUrl, tags, rating, photoUrl, types, propertyLat, propertyLng } = body

    let place
    if (existingPlaceId) {
      // Link to existing Place record
      place = await prisma.place.findUnique({ where: { id: existingPlaceId } })
      if (!place) {
        return NextResponse.json({ success: false, error: 'Place no encontrado' }, { status: 404 })
      }
    } else if (name && address && lat != null && lng != null) {
      // Check if a Place with same Google placeId already exists
      if (body.googlePlaceId) {
        place = await prisma.place.findUnique({ where: { placeId: body.googlePlaceId } })
      }
      if (!place) {
        place = await prisma.place.create({
          data: {
            placeId: body.googlePlaceId || null,
            source: 'MANUAL',
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
    } else {
      return NextResponse.json(
        { success: false, error: 'Se requiere placeId o (name, address, lat, lng)' },
        { status: 400 }
      )
    }

    // Check for duplicate recommendation (same zone + place)
    const existing = await prisma.recommendation.findUnique({
      where: { zoneId_placeId: { zoneId, placeId: place.id } },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Este lugar ya está en esta zona' },
        { status: 409 }
      )
    }

    // Calculate distance if property coords provided
    let distanceMeters: number | null = null
    let walkMinutes: number | null = null
    if (propertyLat != null && propertyLng != null) {
      distanceMeters = Math.round(haversineDistance(propertyLat, propertyLng, place.latitude, place.longitude))
      walkMinutes = Math.round(distanceMeters / 80) // ~80m/min walking
    }

    // Next order
    const maxOrder = await prisma.recommendation.aggregate({
      where: { zoneId },
      _max: { order: true },
    })

    const rec = await prisma.recommendation.create({
      data: {
        zoneId,
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

    return NextResponse.json({ success: true, data: rec }, { status: 201 })
  } catch (error) {
    console.error('Error adding recommendation:', error)
    return NextResponse.json({ success: false, error: 'Error al añadir recomendación' }, { status: 500 })
  }
}

/**
 * PATCH /api/properties/[id]/zones/[zoneId]/recommendations
 * Reorder recommendations in batch.
 * Body: { reorder: [{ id: string, order: number }] }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  try {
    const { id, zoneId } = await params

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

    if (body.reorder && Array.isArray(body.reorder)) {
      await prisma.$transaction(
        body.reorder.map((r: { id: string; order: number }) =>
          prisma.recommendation.update({
            where: { id: r.id },
            data: { order: r.order },
          })
        )
      )
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: 'Body inválido' }, { status: 400 })
  } catch (error) {
    console.error('Error reordering recommendations:', error)
    return NextResponse.json({ success: false, error: 'Error al reordenar' }, { status: 500 })
  }
}

// Haversine formula to calculate distance in meters between two coordinates
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000 // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
