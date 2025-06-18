import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - List all zones with their steps
export async function GET() {
  try {
    const zones = await prisma.zone.findMany({
      include: {
        steps: true
      },
      take: 5
    })
    
    return NextResponse.json({
      success: true,
      zones: zones.map(z => ({
        id: z.id,
        name: z.name,
        stepsCount: z.steps.length,
        steps: z.steps
      }))
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}

// POST - Test creating a step
export async function POST(request: NextRequest) {
  try {
    const { zoneId } = await request.json()
    
    if (!zoneId) {
      return NextResponse.json({
        success: false,
        error: 'zoneId is required'
      })
    }
    
    // Create a test step
    const step = await prisma.step.create({
      data: {
        title: { es: "Test Step Debug" },
        content: { es: "This is a test step created for debugging" },
        type: "TEXT",
        order: 999,
        isPublished: true,
        zoneId: zoneId
      }
    })
    
    return NextResponse.json({
      success: true,
      step,
      message: 'Test step created successfully'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error
    })
  }
}