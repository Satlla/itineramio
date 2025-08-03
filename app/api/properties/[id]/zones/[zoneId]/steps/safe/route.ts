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

// PUT /api/properties/[id]/zones/[zoneId]/steps/safe - Safe version of steps update
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  console.log('✅ SAFE PUT /steps endpoint called')
  
  try {
    const { id: propertyId, zoneId } = await params
    console.log('✅ SAFE - Params:', { propertyId, zoneId })

    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      console.log('✅ SAFE - Auth failed')
      return authResult
    }
    const userId = authResult.userId
    console.log('✅ SAFE - Auth success, userId:', userId)

    // Get request body
    const body = await request.json()
    console.log('✅ SAFE - Body keys:', Object.keys(body))
    console.log('✅ SAFE - Steps count:', body.steps?.length)
    
    const { steps } = body
    
    if (!Array.isArray(steps)) {
      return NextResponse.json({
        success: false,
        error: 'Steps debe ser un array'
      }, { status: 400 })
    }

    // Set RLS config (ignore if fails)
    try {
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`
    } catch (e) {
      console.log('✅ SAFE - RLS skipped:', String(e))
    }

    // Find property (bypass RLS with raw query)
    const properties = await prisma.$queryRaw`
      SELECT id FROM properties 
      WHERE id = ${propertyId} AND "hostId" = ${userId}
      LIMIT 1
    ` as any[]
    
    if (properties.length === 0) {
      console.log('✅ SAFE - Property not found or unauthorized')
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada o no autorizada'
      }, { status: 404 })
    }

    // Find zone (bypass RLS with raw query)
    const zones = await prisma.$queryRaw`
      SELECT id FROM zones 
      WHERE id = ${zoneId} AND "propertyId" = ${propertyId}
      LIMIT 1
    ` as any[]
    
    if (zones.length === 0) {
      console.log('✅ SAFE - Zone not found')
      return NextResponse.json({
        success: false,
        error: 'Zona no encontrada'
      }, { status: 404 })
    }

    console.log('✅ SAFE - Property and zone verified')

    // Delete existing steps (raw query)
    await prisma.$executeRaw`
      DELETE FROM steps WHERE "zoneId" = ${zoneId}
    `
    console.log('✅ SAFE - Old steps deleted')

    // Create steps one by one with raw SQL
    const createdSteps = []
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      
      // Prepare data
      const stepType = (step.type || 'TEXT').toUpperCase()
      const stepOrder = i
      
      // Handle title
      const titleData = step.title || { es: '', en: '', fr: '' }
      const titleJson = JSON.stringify(titleData)
      
      // Handle content
      let contentData = step.content || { es: '', en: '', fr: '' }
      
      // Add media URLs if present
      if (step.media?.url) {
        contentData = { ...contentData, mediaUrl: step.media.url }
      }
      if (step.mediaUrl) {
        contentData = { ...contentData, mediaUrl: step.mediaUrl }
      }
      if (step.linkUrl) {
        contentData = { ...contentData, linkUrl: step.linkUrl }
      }
      
      const contentJson = JSON.stringify(contentData)
      
      console.log(`✅ SAFE - Creating step ${i + 1}/${steps.length}`)
      
      // Create step with raw SQL
      const stepId = `step-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 15)}`
      
      await prisma.$executeRaw`
        INSERT INTO steps (id, "zoneId", type, title, content, "order", "isPublished", "createdAt", "updatedAt")
        VALUES (
          ${stepId},
          ${zoneId},
          ${stepType},
          ${titleJson}::jsonb,
          ${contentJson}::jsonb,
          ${stepOrder},
          true,
          NOW(),
          NOW()
        )
      `
      
      // Get the created step
      const createdStep = await prisma.$queryRaw`
        SELECT id, type, title, content, "order", "isPublished", "createdAt", "updatedAt"
        FROM steps WHERE id = ${stepId}
        LIMIT 1
      ` as any[]
      
      if (createdStep && createdStep.length > 0) {
        createdSteps.push(createdStep[0])
        console.log(`✅ SAFE - Step ${i + 1} created: ${createdStep[0].id}`)
      }
    }

    console.log(`✅ SAFE - All ${createdSteps.length} steps created successfully`)

    return NextResponse.json({
      success: true,
      data: createdSteps,
      message: `Guardados ${createdSteps.length} pasos correctamente`
    })

  } catch (error) {
    console.error('✅ SAFE - Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al guardar los pasos',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}