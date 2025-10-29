import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../../../src/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  try {
    const { id: propertyId, zoneId } = await params
    console.log('🔍 Safe Public Steps endpoint - propertyId:', propertyId, 'zoneId:', zoneId)
    
    // First verify the property is published using raw SQL
    const properties = await prisma.$queryRaw`
      SELECT id, "isPublished"
      FROM properties
      WHERE id = ${propertyId}
        AND "isPublished" = true
      LIMIT 1
    ` as any[]

    let property = properties[0]
    let propertiesWithPrefix: any[] = []

    if (!property) {
      // Try with startsWith for truncated IDs
      propertiesWithPrefix = await prisma.$queryRaw`
        SELECT id, "isPublished"
        FROM properties
        WHERE id LIKE ${propertyId + '%'}
          AND "isPublished" = true
        LIMIT 1
      ` as any[]
      
      if (propertiesWithPrefix.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Propiedad no encontrada o no publicada' 
          },
          { status: 404 }
        )
      }
      
      property = propertiesWithPrefix[0]
    }

    const actualPropertyId = property.id

    // Find zones that match the zoneId using raw SQL
    const zones = await prisma.$queryRaw`
      SELECT id, "propertyId"
      FROM zones
      WHERE id = ${zoneId}
        AND "propertyId" = ${actualPropertyId}
      LIMIT 1
    ` as any[]
    
    let zone = zones[0]
    
    if (!zone) {
      // Try with startsWith for truncated IDs
      const zonesWithPrefix = await prisma.$queryRaw`
        SELECT id, "propertyId"
        FROM zones
        WHERE id LIKE ${zoneId + '%'}
          AND "propertyId" = ${actualPropertyId}
        LIMIT 1
      ` as any[]
      
      zone = zonesWithPrefix[0]
    }

    if (!zone) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Zona no encontrada' 
        },
        { status: 404 }
      )
    }

    const actualZoneId = zone.id

    // Get steps using raw SQL
    const steps = await prisma.$queryRaw`
      SELECT 
        id, "zoneId", type, title, content,
        "isPublished", "createdAt", "updatedAt"
      FROM steps
      WHERE "zoneId" = ${actualZoneId}
        AND "isPublished" = true
      ORDER BY id ASC
    ` as any[]

    // Process steps to extract mediaUrl from content JSON and normalize content format
    const processedSteps = steps.map(step => {
      let mediaUrl = null
      let linkUrl = null
      let thumbnail = null
      let normalizedContent = step.content
      
      try {
        if (step.content && typeof step.content === 'object') {
          const content = step.content as any
          
          // Extract media URLs
          if (content.mediaUrl) {
            mediaUrl = content.mediaUrl
          }
          if (content.linkUrl) {
            linkUrl = content.linkUrl
          }
          if (content.thumbnail) {
            thumbnail = content.thumbnail
          }
          
          // Normalize content format for frontend
          if (content.text && !content.es) {
            // If content has 'text' but no 'es', move text to es
            normalizedContent = {
              ...content,
              es: content.text
            }
          }
        }
      } catch (error) {
        console.error('Error parsing step content:', error)
      }

      return {
        ...step,
        content: normalizedContent,
        mediaUrl,
        linkUrl,
        thumbnail
      }
    })

    console.log('🔍 Safe Public Steps loaded:', {
      propertyId: actualPropertyId,
      zoneId: actualZoneId,
      stepsCount: processedSteps.length
    })

    return NextResponse.json({
      success: true,
      data: processedSteps
    })
  } catch (error) {
    console.error('Error fetching safe public steps:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener los pasos',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}