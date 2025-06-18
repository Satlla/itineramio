import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    const dbTest = await prisma.$queryRaw`SELECT 1+1 as result`
    
    // Count zones and steps
    const zoneCount = await prisma.zone.count()
    const stepCount = await prisma.step.count()
    
    // Get a sample zone with steps
    const sampleZone = await prisma.zone.findFirst({
      include: {
        steps: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
    
    // Test creating and deleting a step
    let testStepResult = { success: false, error: null as any }
    if (sampleZone) {
      try {
        const testStep = await prisma.step.create({
          data: {
            title: { es: "Diagnostic Test Step" },
            content: { es: "This is a test step created by diagnostic" },
            type: "TEXT",
            order: 9999,
            isPublished: true,
            zoneId: sampleZone.id
          }
        })
        
        // Delete it immediately
        await prisma.step.delete({
          where: { id: testStep.id }
        })
        
        testStepResult = { success: true, error: null }
      } catch (error) {
        testStepResult = { success: false, error: error }
      }
    }
    
    return NextResponse.json({
      success: true,
      diagnostic: {
        database: {
          connected: !!dbTest,
          testQuery: dbTest
        },
        counts: {
          zones: zoneCount,
          steps: stepCount
        },
        sampleZone: sampleZone ? {
          id: sampleZone.id,
          name: sampleZone.name,
          stepCount: sampleZone.steps.length
        } : null,
        stepCreationTest: testStepResult,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      diagnostic: {
        database: { connected: false },
        error: error
      }
    })
  }
}