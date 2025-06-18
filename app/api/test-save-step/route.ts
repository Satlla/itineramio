import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get zoneId from query params
    const { searchParams } = new URL(request.url)
    const zoneId = searchParams.get('zoneId')
    
    if (!zoneId) {
      return NextResponse.json({
        success: false,
        error: 'Please provide zoneId in query params. Example: /api/test-save-step?zoneId=YOUR_ZONE_ID'
      })
    }
    
    // Check if zone exists
    const zone = await prisma.zone.findUnique({
      where: { id: zoneId }
    })
    
    if (!zone) {
      return NextResponse.json({
        success: false,
        error: 'Zone not found'
      })
    }
    
    // Create a test step
    const testStep = await prisma.step.create({
      data: {
        title: { es: "Test Step " + new Date().toISOString() },
        content: { es: "This is a test step created via API" },
        type: "TEXT",
        order: 999,
        isPublished: true,
        zoneId: zoneId
      }
    })
    
    // Get all steps for this zone
    const allSteps = await prisma.step.findMany({
      where: { zoneId: zoneId },
      orderBy: { order: 'asc' }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Test step created successfully!',
      createdStep: testStep,
      totalSteps: allSteps.length,
      allSteps: allSteps
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error
    })
  }
}