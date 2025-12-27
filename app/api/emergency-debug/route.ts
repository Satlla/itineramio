import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all zones with steps
    const zones = await prisma.zone.findMany({
      include: {
        steps: {
          orderBy: {
            order: 'asc'
          }
        },
        property: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Also get raw steps
    const steps = await prisma.step.findMany({
      orderBy: [
        { zoneId: 'asc' },
        { order: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      totalZones: zones.length,
      totalSteps: steps.length,
      zones: zones.map(z => ({
        id: z.id,
        name: z.name,
        propertyId: z.propertyId,
        propertyName: z.property?.name,
        stepsCount: z.steps.length,
        steps: z.steps.map(s => ({
          id: s.id,
          type: s.type,
          title: s.title,
          content: s.content,
          order: s.order,
          isPublished: s.isPublished,
          createdAt: s.createdAt
        }))
      })),
      rawSteps: steps
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    })
  }
}