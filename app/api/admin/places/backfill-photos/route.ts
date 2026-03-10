import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { getAdminUser } from '../../../../../src/lib/admin-auth'

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
const BATCH_SIZE = 10 // process N places per call to avoid timeout

/**
 * POST /api/admin/places/backfill-photos
 * Re-fetches Google Place Details for existing places that lack photoUrls.
 * Runs in batches to avoid Vercel timeout.
 * Body: { offset?: number } — call repeatedly until done = true
 */
export async function POST(request: NextRequest) {
  const admin = await getAdminUser(request)
  if (!admin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return NextResponse.json({ error: 'Google Maps API key no configurada' }, { status: 500 })
  }

  const body = await request.json().catch(() => ({}))
  const offset = Number(body.offset ?? 0)

  // Find places with Google Place ID but no photoUrls
  const places = await prisma.place.findMany({
    where: {
      placeId: { not: null },
      OR: [
        { photoUrls: { equals: undefined } },
        { photoUrls: { equals: [] as any } },
      ],
    },
    select: { id: true, placeId: true, name: true },
    skip: offset,
    take: BATCH_SIZE,
    orderBy: { createdAt: 'asc' },
  })

  const total = await prisma.place.count({
    where: {
      placeId: { not: null },
      OR: [
        { photoUrls: { equals: undefined } },
        { photoUrls: { equals: [] as any } },
      ],
    },
  })

  if (places.length === 0) {
    return NextResponse.json({ done: true, processed: 0, total, offset })
  }

  const results: { id: string; name: string; photos: number; status: string }[] = []

  for (const place of places) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.placeId}&fields=photos,price_level&key=${GOOGLE_MAPS_API_KEY}&language=es`
      const res = await fetch(url)
      const data = await res.json()

      if (data.status === 'OK' && data.result?.photos?.length) {
        const photoUrls = data.result.photos.slice(0, 5).map((p: any) =>
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${p.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
        )
        const updateData: any = { photoUrls }
        if (data.result.price_level != null) updateData.priceLevel = data.result.price_level

        await prisma.place.update({ where: { id: place.id }, data: updateData })
        results.push({ id: place.id, name: place.name, photos: photoUrls.length, status: 'ok' })
      } else {
        results.push({ id: place.id, name: place.name, photos: 0, status: data.status || 'no_photos' })
      }

      // Small delay to be polite to Google API
      await new Promise(r => setTimeout(r, 100))
    } catch (err) {
      results.push({ id: place.id, name: place.name, photos: 0, status: 'error' })
    }
  }

  const remaining = total - offset - places.length
  return NextResponse.json({
    done: remaining <= 0,
    processed: places.length,
    total,
    remaining: Math.max(0, remaining),
    nextOffset: offset + places.length,
    results,
  })
}
