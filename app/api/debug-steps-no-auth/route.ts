import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { propertyId, zoneId, steps } = body
    
    console.log('🔍 NO-AUTH DEBUG - Testing with:', { propertyId, zoneId, stepsCount: steps?.length })
    
    if (!propertyId || !zoneId) {
      return NextResponse.json({
        error: 'Missing propertyId or zoneId'
      }, { status: 400 })
    }
    
    if (!Array.isArray(steps)) {
      return NextResponse.json({
        error: 'Steps must be an array'
      }, { status: 400 })
    }

    // Test property exists (no auth check)
    const properties = await prisma.$queryRaw`
      SELECT id FROM properties 
      WHERE id = ${propertyId}
      LIMIT 1
    ` as any[]
    
    if (properties.length === 0) {
      return NextResponse.json({
        error: 'Property not found',
        propertyId
      }, { status: 404 })
    }

    // Test zone exists
    const zones = await prisma.$queryRaw`
      SELECT id FROM zones 
      WHERE id = ${zoneId} AND "propertyId" = ${propertyId}
      LIMIT 1
    ` as any[]
    
    if (zones.length === 0) {
      return NextResponse.json({
        error: 'Zone not found',
        zoneId,
        propertyId
      }, { status: 404 })
    }

    console.log('🔍 NO-AUTH DEBUG - Property and zone verified')

    // Delete existing steps
    await prisma.$executeRaw`
      DELETE FROM steps WHERE "zoneId" = ${zoneId}
    `
    console.log('🔍 NO-AUTH DEBUG - Old steps deleted')

    // Create steps with raw SQL
    const createdSteps = []
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      
      const stepType = (step.type || 'TEXT').toUpperCase()
      const stepOrder = i
      
      const titleData = step.title || { es: '', en: '', fr: '' }
      const titleJson = JSON.stringify(titleData)
      
      let contentData = step.content || { es: '', en: '', fr: '' }
      
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
      const stepId = `step-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 15)}`
      
      console.log(`🔍 NO-AUTH DEBUG - Creating step ${i + 1} with ID: ${stepId}`)
      
      try {
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
        
        const createdStep = await prisma.$queryRaw`
          SELECT id, type, title, content, "order", "isPublished", "createdAt", "updatedAt"
          FROM steps WHERE id = ${stepId}
          LIMIT 1
        ` as any[]
        
        if (createdStep && createdStep.length > 0) {
          createdSteps.push(createdStep[0])
          console.log(`🔍 NO-AUTH DEBUG - Step ${i + 1} created successfully`)
        }
        
      } catch (stepError) {
        console.error(`🔍 NO-AUTH DEBUG - Error creating step ${i + 1}:`, stepError)
        return NextResponse.json({
          error: `Failed to create step ${i + 1}`,
          details: stepError instanceof Error ? stepError.message : String(stepError),
          stepData: { stepType, titleJson, contentJson, stepOrder }
        }, { status: 500 })
      }
    }

    console.log(`🔍 NO-AUTH DEBUG - All ${createdSteps.length} steps created successfully`)

    return NextResponse.json({
      success: true,
      data: createdSteps,
      message: `Created ${createdSteps.length} steps successfully (NO AUTH)`
    })

  } catch (error) {
    console.error('🔍 NO-AUTH DEBUG - General error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}