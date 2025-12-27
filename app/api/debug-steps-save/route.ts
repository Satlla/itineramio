import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { requireAuth } from '../../../src/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 DEBUG STEPS SAVE - Starting')
    
    const body = await request.json()
    console.log('🔍 DEBUG - Request body:', JSON.stringify(body, null, 2))
    
    const { propertyId, zoneId, steps } = body
    console.log('🔍 DEBUG - Extracted:', { propertyId, zoneId, stepsCount: steps?.length })
    
    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      console.log('🔍 DEBUG - Auth failed')
      return NextResponse.json({ error: 'Auth failed', authResult })
    }
    const userId = authResult.userId
    console.log('🔍 DEBUG - Auth success, userId:', userId)

    // Test RLS
    try {
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead
      console.log('🔍 DEBUG - RLS config success')
    } catch (rslError) {
      console.log('🔍 DEBUG - RLS config failed:', rslError)
    }

    // Test property access
    try {
      const property = await prisma.property.findFirst({
        where: {
          id: propertyId,
          hostId: userId
        }
      })
      console.log('🔍 DEBUG - Property found:', !!property)
      if (!property) {
        return NextResponse.json({ error: 'Property not found', propertyId, userId })
      }
    } catch (propError) {
      console.log('🔍 DEBUG - Property error:', propError)
      return NextResponse.json({ error: 'Property error', details: String(propError) })
    }

    // Test zone access
    try {
      const zone = await prisma.zone.findFirst({
        where: {
          id: zoneId,
          propertyId: propertyId
        }
      })
      console.log('🔍 DEBUG - Zone found:', !!zone)
      if (!zone) {
        return NextResponse.json({ error: 'Zone not found', zoneId, propertyId })
      }
    } catch (zoneError) {
      console.log('🔍 DEBUG - Zone error:', zoneError)
      return NextResponse.json({ error: 'Zone error', details: String(zoneError) })
    }

    // Test step creation with minimal data
    try {
      const testStep = await prisma.step.create({
        data: {
          title: { es: 'Test step', en: 'Test step', fr: 'Test step' },
          content: { es: 'Test content', en: 'Test content', fr: 'Test content' },
          type: 'TEXT',
          order: 0,
          isPublished: true,
          zoneId: zoneId
        }
      })
      console.log('🔍 DEBUG - Test step created:', testStep.id)
      
      // Delete test step
      await prisma.step.delete({ where: { id: testStep.id } })
      console.log('🔍 DEBUG - Test step deleted')
      
    } catch (stepError) {
      console.log('🔍 DEBUG - Step creation error:', stepError)
      return NextResponse.json({ 
        error: 'Step creation failed', 
        details: stepError instanceof Error ? stepError.message : String(stepError),
        stack: stepError instanceof Error ? stepError.stack : undefined
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Debug completed successfully',
      data: { propertyId, zoneId, userId, stepsCount: steps?.length }
    })

  } catch (error) {
    console.log('🔍 DEBUG - General error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}