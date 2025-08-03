import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../../src/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  try {
    const { id: propertyId, zoneId } = await params
    console.log('🔍 Safe Public Zone endpoint - propertyId:', propertyId, 'zoneId:', zoneId)
    
    // Find the zone using raw SQL
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
        z."createdAt",
        z."updatedAt",
        z."publishedAt",
        p.name as "propertyName",
        p."isPublished" as "propertyIsPublished"
      FROM zones z
      JOIN properties p ON p.id = z."propertyId"
      WHERE z.id = ${zoneId}
        AND z."propertyId" = ${propertyId}
        AND p."isPublished" = true
        AND (
          (z."isPublished" = true AND z.status = 'ACTIVE')
          OR EXISTS (
            SELECT 1 FROM steps s 
            WHERE s."zoneId" = z.id 
              AND s."isPublished" = true
          )
        )
      LIMIT 1
    ` as any[]
    
    let zone = zones[0]
    
    // If not found with exact match, try startsWith (for Next.js truncation)
    if (!zone) {
      console.log('🔍 Zone not found with exact match, trying startsWith...')
      
      const zonesWithPrefix = await prisma.$queryRaw`
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
          z."createdAt",
          z."updatedAt",
          z."publishedAt",
          p.name as "propertyName",
          p."isPublished" as "propertyIsPublished"
        FROM zones z
        JOIN properties p ON p.id = z."propertyId"
        WHERE z.id LIKE ${zoneId + '%'}
          AND z."propertyId" LIKE ${propertyId + '%'}
          AND p."isPublished" = true
          AND (
            (z."isPublished" = true AND z.status = 'ACTIVE')
            OR EXISTS (
              SELECT 1 FROM steps s 
              WHERE s."zoneId" = z.id 
                AND s."isPublished" = true
            )
          )
        LIMIT 1
      ` as any[]
      
      zone = zonesWithPrefix[0]
    }

    console.log('🔍 Safe Public Zone found:', !!zone)
    
    if (!zone) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Zona no encontrada'
        },
        { status: 404 }
      )
    }

    // Get steps for this zone using raw SQL
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

    const processedZone = {
      ...zone,
      property: {
        name: zone.propertyName,
        isPublished: zone.propertyIsPublished
      },
      steps: processedSteps
    }

    // Remove the flat properties we added
    delete processedZone.propertyName
    delete processedZone.propertyIsPublished

    console.log('🔍 Safe Public Zone loaded:', {
      id: processedZone.id,
      name: processedZone.name,
      stepsCount: processedZone.steps.length
    })

    return NextResponse.json({
      success: true,
      data: processedZone
    })
  } catch (error) {
    console.error('Error fetching safe public zone:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener la zona',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}