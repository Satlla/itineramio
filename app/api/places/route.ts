import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../src/lib/auth'
import { prisma } from '../../../src/lib/prisma'

/**
 * POST /api/places
 * Create or reuse a Place record by googlePlaceId.
 * Returns the Place id.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const body = await request.json()
    const { googlePlaceId, name, address, latitude, longitude, rating, photoUrl, types } = body

    if (!name || !address || latitude == null || longitude == null) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos (name, address, latitude, longitude)' },
        { status: 400 }
      )
    }

    // Find or create place
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
          latitude,
          longitude,
          rating: rating ?? null,
          photoUrl: photoUrl ?? null,
          types: types ?? [],
        },
      })
    }

    return NextResponse.json({ success: true, id: place.id, place })
  } catch (error) {
    console.error('Error creating place:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
