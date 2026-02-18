import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../../../src/lib/auth'
import { prisma } from '../../../../../src/lib/prisma'

/**
 * GET /api/properties/[id]/recommendations
 *
 * List all RECOMMENDATIONS zones and their linked places for a property.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Verify property ownership
    const property = await prisma.property.findFirst({
      where: { id, hostId: userId, deletedAt: null },
      select: { id: true },
    })

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    // Get all RECOMMENDATIONS zones with their recommendations + places
    const zones = await prisma.zone.findMany({
      where: {
        propertyId: id,
        type: 'RECOMMENDATIONS',
      },
      include: {
        recommendations: {
          include: {
            place: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    })

    const data = zones.map(zone => ({
      id: zone.id,
      categoryId: zone.recommendationCategory,
      name: zone.name,
      icon: zone.icon,
      status: zone.status,
      isPublished: zone.isPublished,
      recommendations: zone.recommendations.map(rec => ({
        id: rec.id,
        source: rec.source,
        description: rec.description,
        distanceMeters: rec.distanceMeters,
        walkMinutes: rec.walkMinutes,
        order: rec.order,
        place: rec.place ? {
          id: rec.place.id,
          name: rec.place.name,
          address: rec.place.address,
          latitude: rec.place.latitude,
          longitude: rec.place.longitude,
          rating: rec.place.rating,
          priceLevel: rec.place.priceLevel,
          phone: rec.place.phone,
          openingHours: rec.place.openingHours,
          source: rec.place.source,
          businessStatus: rec.place.businessStatus,
        } : null,
      })),
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener las recomendaciones' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/properties/[id]/recommendations
 *
 * Delete all RECOMMENDATIONS zones for a property.
 * Useful for regenerating from scratch.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Verify property ownership
    const property = await prisma.property.findFirst({
      where: { id, hostId: userId, deletedAt: null },
      select: { id: true },
    })

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    // Delete all RECOMMENDATIONS zones (cascades to recommendations via onDelete)
    const result = await prisma.zone.deleteMany({
      where: {
        propertyId: id,
        type: 'RECOMMENDATIONS',
      },
    })

    return NextResponse.json({
      success: true,
      deletedZones: result.count,
      message: `Se eliminaron ${result.count} zonas de recomendaciones`,
    })
  } catch (error) {
    console.error('Error deleting recommendations:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar las recomendaciones' },
      { status: 500 }
    )
  }
}
