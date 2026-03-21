import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { requireAuth } from '../../../../../../../../src/lib/auth'
import { prisma } from '../../../../../../../../src/lib/prisma'

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
  atm: { es: 'Cajeros', en: 'ATMs', fr: 'Distributeurs', icon: 'Banknote' },
  gas_station: { es: 'Gasolineras', en: 'Gas Stations', fr: 'Stations-service', icon: 'Fuel' },
  transit_station: { es: 'Transporte', en: 'Transit', fr: 'Transport', icon: 'Bus' },
  laundry: { es: 'Lavanderías', en: 'Laundry', fr: 'Laveries', icon: 'WashingMachine' },
  parking: { es: 'Parking', en: 'Parking', fr: 'Parking', icon: 'ParkingCircle' },
}

/**
 * DELETE /api/properties/[id]/zones/[zoneId]/recommendations/[recId]
 * Remove a single recommendation and reorder remaining.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string; recId: string }> }
) {
  try {
    const { id, zoneId, recId } = await params

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

    // Verify rec belongs to this zone
    const rec = await prisma.recommendation.findFirst({
      where: { id: recId, zoneId },
    })
    if (!rec) {
      return NextResponse.json({ success: false, error: 'Recomendación no encontrada' }, { status: 404 })
    }

    await prisma.recommendation.delete({ where: { id: recId } })

    // Reorder remaining
    const remaining = await prisma.recommendation.findMany({
      where: { zoneId },
      orderBy: { order: 'asc' },
    })
    if (remaining.length > 0) {
      await prisma.$transaction(
        remaining.map((r, i) =>
          prisma.recommendation.update({ where: { id: r.id }, data: { order: i } })
        ),
        { timeout: 10000 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error al eliminar recomendación' }, { status: 500 })
  }
}

/**
 * PATCH /api/properties/[id]/zones/[zoneId]/recommendations/[recId]
 * Update a recommendation's description.
 * Body: { description?: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string; recId: string }> }
) {
  try {
    const { id, zoneId, recId } = await params

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

    const rec = await prisma.recommendation.findFirst({
      where: { id: recId, zoneId },
    })
    if (!rec) {
      return NextResponse.json({ success: false, error: 'Recomendación no encontrada' }, { status: 404 })
    }

    const body = await request.json()

    // If categoryId provided and different from current zone's category, move to another zone
    if (body.categoryId && body.categoryId !== (await prisma.zone.findUnique({ where: { id: zoneId }, select: { recommendationCategory: true } }))?.recommendationCategory) {
      const newCategory = body.categoryId as string
      const catInfo = CATEGORY_NAMES[newCategory] || { es: newCategory, en: newCategory, fr: newCategory, icon: 'MapPin' }

      // Find or create RECOMMENDATIONS zone for the new category
      let newZone = await prisma.zone.findFirst({
        where: { propertyId: id, type: 'RECOMMENDATIONS', recommendationCategory: newCategory },
      })

      if (!newZone) {
        const maxZoneOrder = await prisma.zone.aggregate({
          where: { propertyId: id },
          _max: { order: true },
        })
        newZone = await prisma.zone.create({
          data: {
            propertyId: id,
            name: { es: catInfo.es, en: catInfo.en, fr: catInfo.fr },
            icon: catInfo.icon,
            type: 'RECOMMENDATIONS',
            recommendationCategory: newCategory,
            qrCode: `qr_${crypto.randomUUID()}`,
            accessCode: crypto.randomUUID().slice(0, 8).toUpperCase(),
            order: (maxZoneOrder._max.order ?? -1) + 1,
            status: 'ACTIVE',
            isPublished: true,
          },
        })
      }

      // Check for duplicate in new zone
      const duplicate = await prisma.recommendation.findUnique({
        where: { zoneId_placeId: { zoneId: newZone.id, placeId: rec.placeId! } },
      })
      if (duplicate) {
        // Delete current rec (it's already in the target zone)
        await prisma.recommendation.delete({ where: { id: recId } })
        return NextResponse.json({ success: true, data: duplicate, movedToZone: newZone.id })
      }

      const maxOrder = await prisma.recommendation.aggregate({
        where: { zoneId: newZone.id },
        _max: { order: true },
      })

      const moved = await prisma.recommendation.update({
        where: { id: recId },
        data: {
          zoneId: newZone.id,
          order: (maxOrder._max.order ?? -1) + 1,
          ...(body.description !== undefined && { description: body.description }),
          ...(body.highlight !== undefined && { highlight: body.highlight }),
          ...(body.externalUrl !== undefined && { externalUrl: body.externalUrl }),
          ...(body.tags !== undefined && { tags: body.tags }),
        },
        include: { place: true },
      })

      return NextResponse.json({ success: true, data: moved, movedToZone: newZone.id })
    }

    const updated = await prisma.recommendation.update({
      where: { id: recId },
      data: {
        ...(body.description !== undefined && { description: body.description }),
        ...(body.highlight !== undefined && { highlight: body.highlight }),
        ...(body.externalUrl !== undefined && { externalUrl: body.externalUrl }),
        ...(body.tags !== undefined && { tags: body.tags }),
      },
      include: { place: true },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error al actualizar recomendación' }, { status: 500 })
  }
}
