import { NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET() {
  try {
    // Get the most recent property with Check In zone
    const checkInZone = await prisma.zone.findFirst({
      where: {
        name: 'Check In'
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        steps: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!checkInZone) {
      return NextResponse.json({ error: 'No Check In zone found' })
    }

    // Debug info
    const debugInfo = {
      zoneName: checkInZone.name,
      zoneId: checkInZone.id,
      stepsCount: checkInZone.steps.length,
      steps: checkInZone.steps.map(step => ({
        title: step.title,
        type: step.type,
        content: step.content,
        contentType: typeof step.content,
        contentKeys: step.content && typeof step.content === 'object' ? Object.keys(step.content as any) : [],
        rawContent: JSON.stringify(step.content)
      }))
    }

    return NextResponse.json(debugInfo)
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ 
      error: 'Error in debug', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}