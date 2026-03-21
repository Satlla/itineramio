import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { checkHostManualesAccess, MANUAL_BLOCKED_MESSAGE } from '../../../../../src/lib/public-module-check'
import { checkRateLimitAsync, getRateLimitKey } from '../../../../../src/lib/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const rateLimitResult = await checkRateLimitAsync(
      getRateLimitKey(request, null, 'public-guide'),
      { maxRequests: 60, windowMs: 60 * 1000 }
    )
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    let property = await prisma.property.findFirst({
      where: { id, isPublished: true },
      select: {
        id: true, name: true, slug: true, description: true, type: true,
        street: true, city: true, state: true, country: true, postalCode: true,
        bedrooms: true, bathrooms: true, maxGuests: true, squareMeters: true,
        profileImage: true, hostContactName: true, hostContactPhone: true,
        hostContactEmail: true, hostContactLanguage: true, hostContactPhoto: true,
        status: true, isPublished: true, propertySetId: true, hostId: true,
        createdAt: true, updatedAt: true, publishedAt: true
      }
    })

    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada o no publicada'
      }, { status: 404 })
    }

    // Check if host has MANUALES module access
    if (property.hostId) {
      const moduleAccess = await checkHostManualesAccess(property.hostId)
      if (!moduleAccess.hasAccess) {
        return NextResponse.json({
          success: false,
          error: MANUAL_BLOCKED_MESSAGE.description,
          code: MANUAL_BLOCKED_MESSAGE.code,
          blocked: true
        }, { status: 403 })
      }
    }

    // Get zones and steps safely using raw SQL
    const zones = await prisma.$queryRaw`
      SELECT
        z.id,
        z.name,
        z.slug,
        z.icon,
        z.description,
        z.color,
        z.status,
        z."isPublished",
        z."propertyId",
        z."order",
        z.type,
        z."recommendationCategory",
        z."createdAt",
        z."updatedAt",
        z."publishedAt"
      FROM zones z
      WHERE z."propertyId" = ${property.id}
        AND (
          (z."isPublished" = true AND z.status = 'ACTIVE')
          OR EXISTS (
            SELECT 1 FROM steps s
            WHERE s."zoneId" = z.id
              AND s."isPublished" = true
          )
          OR (
            z.type = 'RECOMMENDATIONS'
            AND z."isPublished" = true
            AND EXISTS (
              SELECT 1 FROM recommendations r
              WHERE r."zoneId" = z.id
            )
          )
        )
      ORDER BY COALESCE(z."order", 999999) ASC, z.id ASC
    ` as any[]

    // Batch-count recommendations for all RECOMMENDATIONS zones in a single query
    const recommendationZoneIds = zones
      .filter((z: any) => z.type === 'RECOMMENDATIONS')
      .map((z: any) => z.id)

    const recCountRows = recommendationZoneIds.length > 0
      ? await prisma.recommendation.groupBy({
          by: ['zoneId'],
          where: { zoneId: { in: recommendationZoneIds } },
          _count: { zoneId: true }
        })
      : []

    const recCountMap = new Map(recCountRows.map(r => [r.zoneId, r._count.zoneId]))

    // Get steps for each zone (and recommendation count for RECOMMENDATIONS zones)
    const zonesWithSteps = await Promise.all(
      zones.map(async (zone: any) => {
        // For RECOMMENDATIONS zones, count recommendations instead of steps
        if (zone.type === 'RECOMMENDATIONS') {
          return {
            ...zone,
            stepsCount: recCountMap.get(zone.id) ?? 0,
            steps: []
          }
        }

        const steps = await prisma.$queryRaw`
          SELECT
            id, "zoneId", type, title, content,
            "isPublished", "createdAt", "updatedAt"
          FROM steps
          WHERE "zoneId" = ${zone.id}
            AND "isPublished" = true
          ORDER BY id ASC
        ` as any[]

        // Process steps to extract mediaUrl from content JSON
        const processedSteps = steps.map(step => {
          let mediaUrl = null
          let linkUrl = null

          try {
            if (step.content && typeof step.content === 'object') {
              const content = step.content as any
              if (content.mediaUrl) {
                mediaUrl = content.mediaUrl
              }
              if (content.linkUrl) {
                linkUrl = content.linkUrl
              }
            }
          } catch (error) {
            // ignore parse errors
          }

          return {
            ...step,
            mediaUrl,
            linkUrl
          }
        })

        return {
          ...zone,
          stepsCount: processedSteps.length,
          steps: processedSteps
        }
      })
    )

    // Reconstruct property object with zones
    property = {
      ...property,
      zones: zonesWithSteps
    } as any

    // Strip internal fields before returning to unauthenticated public clients
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hostId, propertySetId, ...publicProperty } = property as typeof property & { hostId: string; propertySetId: string | null }
    const result = publicProperty

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Error al obtener la propiedad'
    }, { status: 500 })
  }
}