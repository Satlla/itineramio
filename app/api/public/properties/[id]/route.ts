import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🔍 Public Property endpoint - received ID:', id)
    
    // Use raw SQL to find property safely
    let properties = await prisma.$queryRaw`
      SELECT 
        id, name, slug, description, type,
        street, city, state, country, "postalCode",
        bedrooms, bathrooms, "maxGuests", "squareMeters",
        "profileImage", "hostContactName", "hostContactPhone",
        "hostContactEmail", "hostContactLanguage", "hostContactPhoto",
        status, "isPublished", "propertySetId", "hostId",
        "createdAt", "updatedAt", "publishedAt"
      FROM properties
      WHERE id = ${id}
        AND "isPublished" = true
      LIMIT 1
    ` as any[]
    
    let property = properties[0]
    
    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada o no publicada'
      }, { status: 404 })
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
        )
      ORDER BY z.id ASC
    ` as any[]

    // Get steps for each zone
    const zonesWithSteps = await Promise.all(
      zones.map(async (zone: any) => {
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

    // Reconstruct property object with zones
    property = {
      ...property,
      zones: zonesWithSteps
    }
    
    console.log('🔍 Public Property found:', !!property)
    if (property) {
      console.log('🔍 Property details:', { 
        id: property.id, 
        name: property.name, 
        zonesCount: property.zones.length,
        isPublished: property.isPublished 
      })
    }

    const result = property
    
    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error fetching public property:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener la propiedad'
    }, { status: 500 })
  }
}