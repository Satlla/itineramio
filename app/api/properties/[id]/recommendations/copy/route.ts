import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../../../../src/lib/auth'
import { prisma } from '../../../../../../src/lib/prisma'

/**
 * POST /api/properties/[id]/recommendations/copy
 *
 * Copy recommendation zones from source property to one or more target properties.
 * Only copies zones whose recommendationCategory is in the given categories list.
 *
 * Body: { targetPropertyIds: string[], categories: string[] }
 * - categories: array of recommendationCategory values (e.g. ["parking", "supermarket"])
 *   If empty or omitted → copies ALL categories.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sourceId } = await params

    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult
    const { userId } = authResult

    const body = await request.json()
    const { targetPropertyIds, categories } = body as {
      targetPropertyIds: string[]
      categories?: string[]
    }

    if (!Array.isArray(targetPropertyIds) || targetPropertyIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Debes seleccionar al menos una propiedad destino' },
        { status: 400 }
      )
    }

    // Verify source property belongs to user
    const sourceProperty = await prisma.property.findFirst({
      where: { id: sourceId, hostId: userId, deletedAt: null },
      select: { id: true },
    })
    if (!sourceProperty) {
      return NextResponse.json({ success: false, error: 'Propiedad origen no encontrada' }, { status: 404 })
    }

    // Verify all target properties belong to the same user
    const targetProperties = await prisma.property.findMany({
      where: { id: { in: targetPropertyIds }, hostId: userId, deletedAt: null },
      select: { id: true },
    })
    if (targetProperties.length === 0) {
      return NextResponse.json({ success: false, error: 'Propiedades destino no encontradas' }, { status: 404 })
    }
    const validTargetIds = targetProperties.map((p) => p.id)

    // Fetch source recommendation zones
    const sourceZonesWhere: Record<string, unknown> = {
      propertyId: sourceId,
      type: 'RECOMMENDATIONS',
    }
    if (categories && categories.length > 0) {
      sourceZonesWhere.recommendationCategory = { in: categories }
    }

    const sourceZones = await prisma.zone.findMany({
      where: sourceZonesWhere,
      include: {
        recommendations: {
          include: { place: true },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (sourceZones.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No hay recomendaciones en las categorías seleccionadas' },
        { status: 400 }
      )
    }

    let totalCopied = 0

    for (const targetId of validTargetIds) {
      // Get current max zone order for target property
      const maxOrderResult = await prisma.zone.aggregate({
        where: { propertyId: targetId },
        _max: { order: true },
      })
      let zoneOrder = (maxOrderResult._max.order ?? -1) + 1

      for (const srcZone of sourceZones) {
        if (srcZone.recommendations.length === 0) continue

        // Find or create matching zone in target property
        let targetZone = await prisma.zone.findFirst({
          where: {
            propertyId: targetId,
            type: 'RECOMMENDATIONS',
            recommendationCategory: srcZone.recommendationCategory,
          },
          select: { id: true },
        })

        if (!targetZone) {
          targetZone = await prisma.zone.create({
            data: {
              propertyId: targetId,
              name: srcZone.name,
              icon: srcZone.icon,
              type: 'RECOMMENDATIONS',
              recommendationCategory: srcZone.recommendationCategory,
              order: zoneOrder++,
              status: 'PUBLISHED',
              isPublished: true,
            },
            select: { id: true },
          })
        }

        // Get placeIds already in target zone to avoid duplicates
        const existingRecs = await prisma.recommendation.findMany({
          where: { zoneId: targetZone.id },
          select: { placeId: true, order: true },
        })
        const existingPlaceIds = new Set(existingRecs.map((r) => r.placeId).filter(Boolean))
        const currentMaxOrder = existingRecs.reduce((max, r) => Math.max(max, r.order), -1)
        let recOrder = currentMaxOrder + 1

        const toCreate = srcZone.recommendations.filter(
          (r) => r.placeId && !existingPlaceIds.has(r.placeId)
        )

        if (toCreate.length > 0) {
          await prisma.recommendation.createMany({
            data: toCreate.map((rec) => ({
              zoneId: targetZone!.id,
              placeId: rec.placeId,
              source: rec.source,
              description: rec.description,
              distanceMeters: rec.distanceMeters,
              walkMinutes: rec.walkMinutes,
              order: recOrder++,
            })),
          })
          totalCopied += toCreate.length
        }
      }
    }

    return NextResponse.json({
      success: true,
      copiedTo: validTargetIds.length,
      totalRecommendations: totalCopied,
    })
  } catch (error) {
    console.error('Error copying recommendations:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
