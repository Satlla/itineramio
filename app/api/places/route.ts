import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '../../../src/lib/auth'
import { getAdminUser } from '../../../src/lib/admin-auth'
import { prisma } from '../../../src/lib/prisma'

/**
 * POST /api/places
 * Create or reuse a Place record by googlePlaceId.
 * Returns the Place id.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    const admin = await getAdminUser(request)
    if (!user && !admin) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { googlePlaceId, name, address, latitude, longitude, rating, photoUrl, photoUrls, priceLevel, types } = body

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
          photoUrls: photoUrls ?? [],
          priceLevel: priceLevel ?? null,
          types: types ?? [],
          lastFetchedAt: new Date(),
        },
      })
    } else if (photoUrls?.length && !(place as any).photoUrls?.length) {
      // Update photo URLs if place already exists but lacks them
      place = await prisma.place.update({
        where: { id: place.id },
        data: { photoUrls, photoUrl: photoUrl ?? place.photoUrl },
      })
    }

    return NextResponse.json({ success: true, id: place.id, place })
  } catch (error) {
    console.error('Error creating place:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
