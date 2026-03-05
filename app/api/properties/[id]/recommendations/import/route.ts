import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../../../../src/lib/auth'
import { prisma } from '../../../../../../src/lib/prisma'
import { getCategoryById } from '../../../../../../src/lib/recommendations/categories'
import crypto from 'crypto'

/**
 * POST /api/properties/[id]/recommendations/import
 * Import recommendations from another property.
 * Body: { sourcePropertyId, categoryIds, targetLat?, targetLng? }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetPropertyId } = await params

    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult
    const userId = authResult.userId

    // Verify ownership of target property
    const targetProperty = await prisma.property.findFirst({
      where: { id: targetPropertyId, hostId: userId, deletedAt: null },
      select: { id: true },
    })
    if (!targetProperty) {
      return NextResponse.json({ success: false, error: 'Propiedad destino no encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const { sourcePropertyId, categoryIds, targetLat, targetLng } = body

    if (!sourcePropertyId || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos (sourcePropertyId, categoryIds)' },
        { status: 400 }
      )
    }

    // Verify ownership of source property
    const sourceProperty = await prisma.property.findFirst({
      where: { id: sourcePropertyId, hostId: userId, deletedAt: null },
      select: { id: true },
    })
    if (!sourceProperty) {
      return NextResponse.json({ success: false, error: 'Propiedad origen no encontrada' }, { status: 404 })
    }

    // Fetch source zones with recommendations + places
    const sourceZones = await prisma.zone.findMany({
      where: {
        propertyId: sourcePropertyId,
        type: 'RECOMMENDATIONS',
        recommendationCategory: { in: categoryIds },
      },
      include: {
        recommendations: {
          include: { place: true },
          orderBy: { order: 'asc' },
        },
      },
    })

    let importedCount = 0
    let zonesCreated = 0
    let skippedDuplicates = 0

    for (const sourceZone of sourceZones) {
      const categoryId = sourceZone.recommendationCategory
      if (!categoryId) continue

      const category = getCategoryById(categoryId)
      if (!category) continue

      // Find or create target zone for this category
      let targetZone = await prisma.zone.findFirst({
        where: { propertyId: targetPropertyId, type: 'RECOMMENDATIONS', recommendationCategory: categoryId },
      })

      if (!targetZone) {
        const maxZoneOrder = await prisma.zone.aggregate({
          where: { propertyId: targetPropertyId },
          _max: { order: true },
        })
        targetZone = await prisma.zone.create({
          data: {
            propertyId: targetPropertyId,
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
        zonesCreated++
      }

      // Import each recommendation
      for (const rec of sourceZone.recommendations) {
        if (!rec.place) continue

        // Skip duplicates
        const existing = await prisma.recommendation.findUnique({
          where: { zoneId_placeId: { zoneId: targetZone.id, placeId: rec.place.id } },
        })
        if (existing) {
          skippedDuplicates++
          continue
        }

        // Calculate distance from target property
        let distanceMeters: number | null = null
        let walkMinutes: number | null = null
        if (targetLat != null && targetLng != null) {
          distanceMeters = Math.round(haversineDistance(targetLat, targetLng, rec.place.latitude, rec.place.longitude))
          walkMinutes = Math.round(distanceMeters / 80)
        }

        // Next order within zone
        const maxOrder = await prisma.recommendation.aggregate({
          where: { zoneId: targetZone.id },
          _max: { order: true },
        })

        await prisma.recommendation.create({
          data: {
            zoneId: targetZone.id,
            placeId: rec.place.id,
            source: 'MANUAL',
            distanceMeters,
            walkMinutes,
            order: (maxOrder._max.order ?? -1) + 1,
          },
        })
        importedCount++
      }
    }

    return NextResponse.json({
      success: true,
      data: { importedCount, zonesCreated, skippedDuplicates },
    }, { status: 201 })
  } catch (error) {
    console.error('Error importing recommendations:', error)
    return NextResponse.json({ success: false, error: 'Error al importar recomendaciones' }, { status: 500 })
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
