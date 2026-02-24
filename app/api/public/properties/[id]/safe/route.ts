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
    
    // First check if this is a demo preview property
    const demoCheck = await prisma.$queryRaw`
      SELECT id, "isDemoPreview", "demoExpiresAt"
      FROM properties
      WHERE id = ${id} AND "isDemoPreview" = true
      LIMIT 1
    ` as any[]

    const demoProperty = demoCheck[0]
    const isDemo = !!demoProperty

    if (isDemo) {
      // Demo property: check expiration instead of isPublished/subscription
      if (demoProperty.demoExpiresAt && new Date(demoProperty.demoExpiresAt) <= new Date()) {
        return NextResponse.json({
          success: false,
          error: 'Este demo ha expirado',
          code: 'DEMO_EXPIRED'
        }, { status: 410 })
      }
    }

    // Use raw SQL to get property safely
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

    // Get steps for each zone (and recommendation count for RECOMMENDATIONS zones)
    const zonesWithSteps = await Promise.all(
      zones.map(async (zone: any) => {
        // For RECOMMENDATIONS zones, count recommendations instead of steps
        if (zone.type === 'RECOMMENDATIONS') {
          const recCount = await prisma.recommendation.count({
            where: { zoneId: zone.id },
          })
          return {
            ...zone,
            stepsCount: recCount,
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
            console.error('Error parsing step content:', error)
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