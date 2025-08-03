import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 SIMPLE DEBUG - Starting')
    
    // Test database connection
    const dbTest = await prisma.$executeRaw`SELECT 1`
    console.log('🔍 DB connection:', dbTest)
    
    // Test zone access for the specific zone
    const zoneId = 'cmdsrdyyh001ll4048qooi6k1'
    const propertyId = 'cmdsrdyil001jl404b3qvcgxr'
    
    const zone = await prisma.zone.findFirst({
      where: {
        id: zoneId,
      },
      include: {
        property: true,
        steps: true
      }
    })
    
    console.log('🔍 Zone found:', !!zone)
    console.log('🔍 Zone data:', zone ? {
      id: zone.id,
      name: zone.name,
      propertyId: zone.propertyId,
      stepsCount: zone.steps?.length || 0
    } : null)
    
    // Test step creation with minimal data (and immediate deletion)
    try {
      const testStep = await prisma.step.create({
        data: {
          title: { es: 'Debug test', en: 'Debug test', fr: 'Debug test' },
          content: { es: 'Debug content', en: 'Debug content', fr: 'Debug content' },
          type: 'TEXT',
          order: 999,
          isPublished: true,
          zoneId: zoneId
        }
      })
      console.log('🔍 Test step created:', testStep.id)
      
      // Delete test step immediately
      await prisma.step.delete({ where: { id: testStep.id } })
      console.log('🔍 Test step deleted')
      
    } catch (stepError) {
      console.log('🔍 Step creation error:', stepError)
      return NextResponse.json({ 
        error: 'Step creation failed', 
        details: stepError instanceof Error ? stepError.message : String(stepError),
        stack: stepError instanceof Error ? stepError.stack : undefined,
        zoneExists: !!zone,
        zoneData: zone ? {
          id: zone.id,
          name: zone.name,
          propertyId: zone.propertyId
        } : null
      })
    }

    return NextResponse.json({
      success: true,
      message: 'All tests passed',
      data: {
        dbConnected: true,
        zoneExists: !!zone,
        zoneId,
        propertyId,
        zoneData: zone ? {
          id: zone.id,
          name: zone.name,
          propertyId: zone.propertyId,
          stepsCount: zone.steps?.length || 0
        } : null
      }
    })

  } catch (error) {
    console.log('🔍 General error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { zoneId, propertyId, steps } = body
    
    // Test the exact same logic as the main endpoint but with more detailed logging
    console.log('🔍 POST DEBUG - Zone ID:', zoneId)
    console.log('🔍 POST DEBUG - Property ID:', propertyId) 
    console.log('🔍 POST DEBUG - Steps:', steps)
    
    // Find zone exactly like main endpoint
    let zone = await prisma.zone.findFirst({
      where: {
        id: zoneId,
        propertyId: propertyId
      }
    })
    
    console.log('🔍 POST DEBUG - Zone found (exact match):', !!zone)
    
    if (!zone) {
      const zones = await prisma.zone.findMany({
        where: {
          id: { startsWith: zoneId },
          propertyId: propertyId
        }
      })
      zone = zones[0]
      console.log('🔍 POST DEBUG - Zone found (startsWith):', !!zone)
    }
    
    if (!zone) {
      return NextResponse.json({
        error: 'Zone not found',
        debug: { zoneId, propertyId }
      }, { status: 404 })
    }
    
    // Test step creation
    const testData = {
      title: { es: 'Test', en: 'Test', fr: 'Test' },
      content: { es: 'Test content', en: 'Test content', fr: 'Test content' },
      type: 'TEXT',
      order: 0,
      isPublished: true,
      zoneId: zone.id
    }
    
    console.log('🔍 POST DEBUG - Test step data:', testData)
    
    const testStep = await prisma.step.create({
      data: testData
    })
    
    console.log('🔍 POST DEBUG - Test step created:', testStep.id)
    
    // Clean up
    await prisma.step.delete({ where: { id: testStep.id } })
    
    return NextResponse.json({
      success: true,
      message: 'Step creation test passed',
      testStepId: testStep.id
    })
    
  } catch (error) {
    console.log('🔍 POST DEBUG - Error:', error)
    return NextResponse.json({
      error: 'Step creation failed',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}