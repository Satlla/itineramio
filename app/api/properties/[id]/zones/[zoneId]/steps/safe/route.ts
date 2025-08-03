import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../../../../src/lib/auth'

// Safe endpoint for getting steps - uses raw SQL to avoid schema issues
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  try {
    const { id: propertyId, zoneId } = await params

    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Set JWT claims for RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`

    // Verify property ownership with raw SQL
    const propertyCheck = await prisma.$queryRaw`
      SELECT id FROM properties 
      WHERE id = ${propertyId} 
      AND "hostId" = ${userId}
      LIMIT 1
    ` as any[]

    if (!propertyCheck.length) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada o no autorizada' },
        { status: 404 }
      )
    }

    // Find zone with raw SQL
    const zoneCheck = await prisma.$queryRaw`
      SELECT id FROM zones 
      WHERE (id = ${zoneId} OR id LIKE ${zoneId + '%'})
      AND "propertyId" = ${propertyId}
      LIMIT 1
    ` as any[]

    if (!zoneCheck.length) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Zona no encontrada' 
        },
        { status: 404 }
      )
    }

    const actualZoneId = zoneCheck[0].id

    // Get steps with raw SQL - include all columns that exist
    const steps = await prisma.$queryRaw`
      SELECT 
        id, 
        "zoneId", 
        type, 
        title, 
        content,
        "isPublished", 
        "createdAt", 
        "updatedAt",
        COALESCE("order", 0) as "order"
      FROM steps
      WHERE "zoneId" = ${actualZoneId}
      ORDER BY id ASC
    ` as any[]

    // Process steps to extract mediaUrl from content JSON
    const processedSteps = steps.map((step: any) => {
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
        linkUrl,
        content: step.content,
        order: step.order || 0
      }
    })

    return NextResponse.json({
      success: true,
      data: processedSteps
    })
  } catch (error) {
    console.error('Error fetching steps (safe endpoint):', error)
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