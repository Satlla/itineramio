import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { checkHostManualesAccess, MANUAL_BLOCKED_MESSAGE } from '../../../../../../src/lib/public-module-check'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🔍 Safe Public Property endpoint - received ID:', id)
    
    // Get property in a single query (handles both published and demo)
    const properties = await prisma.$queryRaw`
      SELECT
        id, name, slug, description, type,
        street, city, state, country, "postalCode",
        bedrooms, bathrooms, "maxGuests", "squareMeters",
        "profileImage", "hostContactName", "hostContactPhone",
        "hostContactEmail", "hostContactLanguage", "hostContactPhoto",
        status, "isPublished", "propertySetId", "hostId",
        "isDemoPreview", "demoExpiresAt",
        "createdAt", "updatedAt", "publishedAt"
      FROM properties
      WHERE id = ${id}
        AND (
          "isPublished" = true
          OR ("isDemoPreview" = true AND "demoExpiresAt" > NOW())
        )
      LIMIT 1
    ` as any[]

    const property = properties[0]
    const isDemo = !!property?.isDemoPreview

    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada o no publicada'
      }, { status: 404 })
    }

    // Check if host has MANUALES module access (skip for demo properties)
    if (!isDemo && property.hostId) {
      const moduleAccess = await checkHostManualesAccess(property.hostId)
      if (!moduleAccess.hasAccess) {
        console.log(`🚫 Manual blocked for property ${id} - host ${property.hostId} has no MANUALES access: ${moduleAccess.blockedReason}`)
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

    // Get ALL steps and recommendation counts in batch (instead of N queries per zone)
    const zoneIds = zones.map((z: any) => z.id)
    const recZoneIds = zones.filter((z: any) => z.type === 'RECOMMENDATIONS').map((z: any) => z.id)

    const [allSteps, recCounts] = await Promise.all([
      zoneIds.length > 0
        ? prisma.$queryRaw`
            SELECT id, "zoneId", type, title, content, "isPublished", "createdAt", "updatedAt"
            FROM steps
            WHERE "zoneId" = ANY(${zoneIds}::text[])
              AND "isPublished" = true
            ORDER BY "zoneId", "order" ASC, id ASC
          ` as Promise<any[]>
        : Promise.resolve([]),
      recZoneIds.length > 0
        ? prisma.$queryRaw`
            SELECT "zoneId", COUNT(*)::int as count
            FROM recommendations
            WHERE "zoneId" = ANY(${recZoneIds}::text[])
            GROUP BY "zoneId"
          ` as Promise<any[]>
        : Promise.resolve([]),
    ])

    // Group steps by zoneId
    const stepsByZone = new Map<string, any[]>()
    for (const step of allSteps) {
      let mediaUrl = null
      let linkUrl = null
      try {
        if (step.content && typeof step.content === 'object') {
          if (step.content.mediaUrl) mediaUrl = step.content.mediaUrl
          if (step.content.linkUrl) linkUrl = step.content.linkUrl
        }
      } catch {}
      const processed = { ...step, mediaUrl, linkUrl }
      if (!stepsByZone.has(step.zoneId)) stepsByZone.set(step.zoneId, [])
      stepsByZone.get(step.zoneId)!.push(processed)
    }

    const recCountMap = new Map<string, number>()
    for (const r of recCounts) recCountMap.set(r.zoneId, r.count)

    const zonesWithSteps = zones.map((zone: any) => {
      if (zone.type === 'RECOMMENDATIONS') {
        return { ...zone, stepsCount: recCountMap.get(zone.id) || 0, steps: [] }
      }
      const steps = stepsByZone.get(zone.id) || []
      return { ...zone, stepsCount: steps.length, steps }
    })

    const result = {
      ...property,
      zones: zonesWithSteps
    }
    
    console.log('🔍 Safe Public Property loaded:', {
      id: result.id,
      name: result.name,
      zonesCount: result.zones.length
    })
    
    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error fetching safe public property:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener la propiedad',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}