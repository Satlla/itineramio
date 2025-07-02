import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { propertyId, zoneId, stepIndex, totalSteps, timestamp, sessionId, userId } = await request.json()

    // Validate required fields
    if (!propertyId || !zoneId || stepIndex === undefined || !totalSteps) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Save tracking event to database
    await prisma.trackingEvent.create({
      data: {
        type: 'STEP_VIEWED',
        propertyId,
        zoneId,
        userId: userId || null,
        sessionId: sessionId || null,
        metadata: {
          stepIndex,
          totalSteps
        },
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      }
    })

    // Update analytics asynchronously
    updateZoneAnalytics(zoneId, propertyId).catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'Step view tracked successfully'
    })
  } catch (error) {
    console.error('Error tracking step view:', error)
    return NextResponse.json(
      { error: 'Failed to track step view' },
      { status: 500 }
    )
  }
}

async function updateZoneAnalytics(zoneId: string, propertyId: string) {
  try {
    // Get zone analytics or create if doesn't exist
    let analytics = await prisma.zoneAnalytics.findUnique({
      where: { zoneId }
    })

    if (!analytics) {
      analytics = await prisma.zoneAnalytics.create({
        data: {
          zoneId,
          totalViews: 1,
          uniqueVisitors: 1,
          lastCalculatedAt: new Date()
        }
      })
    } else {
      // Update view count
      await prisma.zoneAnalytics.update({
        where: { zoneId },
        data: {
          totalViews: { increment: 1 },
          lastCalculatedAt: new Date()
        }
      })
    }

    // Update property analytics
    await prisma.propertyAnalytics.upsert({
      where: { propertyId },
      update: {
        totalViews: { increment: 1 },
        lastCalculatedAt: new Date()
      },
      create: {
        propertyId,
        totalViews: 1,
        lastCalculatedAt: new Date()
      }
    })
  } catch (error) {
    console.error('Error updating analytics:', error)
  }
}