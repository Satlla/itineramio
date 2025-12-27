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

    // Get visitor info
    const userAgent = request.headers.get('user-agent') || undefined
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'
    const visitorIp = ip.split(',')[0].trim()

    // Try to save tracking but don't fail if it doesn't work
    try {
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
          userAgent,
          ipAddress: visitorIp
        }
      })

      // Update analytics asynchronously (don't wait for it)
      updateZoneAnalytics(zoneId, propertyId, visitorIp, userAgent).catch(console.error)
    } catch (dbError) {
      console.error('Database tracking failed (continuing):', dbError)
      // Don't fail the request - just log the error
    }

    return NextResponse.json({
      success: true,
      message: 'Step view tracked successfully'
    })
  } catch (error) {
    console.error('Error tracking step view:', error)
    // Return success anyway to not block video loading
    return NextResponse.json({
      success: true,
      message: 'Tracking skipped due to error'
    })
  }
}

async function updateZoneAnalytics(
  zoneId: string,
  propertyId: string,
  visitorIp: string,
  userAgent?: string
) {
  try {
    // Get zone with property info to obtain hostId
    const zone = await prisma.zone.findUnique({
      where: { id: zoneId },
      select: {
        id: true,
        viewCount: true,
        property: {
          select: { hostId: true }
        }
      }
    })

    if (!zone || !zone.property) {
      console.error('Zone or property not found for analytics update')
      return
    }

    // Check if this IP has viewed this zone before
    const existingZoneView = await prisma.zoneView.findFirst({
      where: {
        zoneId,
        visitorIp
      }
    })

    const isUniqueVisitor = !existingZoneView

    // Create zone view record
    await prisma.zoneView.create({
      data: {
        zoneId,
        propertyId,
        hostId: zone.property.hostId,
        visitorIp,
        userAgent
      }
    })

    // Update zone viewCount and lastViewedAt
    await prisma.zone.update({
      where: { id: zoneId },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date()
      }
    })

    // Update or create zone analytics
    await prisma.zoneAnalytics.upsert({
      where: { zoneId },
      create: {
        zoneId,
        totalViews: 1,
        uniqueVisitors: 1,
        lastViewedAt: new Date(),
        lastCalculatedAt: new Date()
      },
      update: {
        totalViews: { increment: 1 },
        uniqueVisitors: isUniqueVisitor ? { increment: 1 } : undefined,
        lastViewedAt: new Date(),
        lastCalculatedAt: new Date()
      }
    })

    // Also update property analytics zoneViews counter
    await prisma.propertyAnalytics.upsert({
      where: { propertyId },
      create: {
        propertyId,
        zoneViews: 1,
        totalViews: 0,
        uniqueVisitors: 0,
        lastCalculatedAt: new Date()
      },
      update: {
        zoneViews: { increment: 1 },
        lastCalculatedAt: new Date()
      }
    })

  } catch (error) {
    console.error('Error updating zone analytics:', error)
  }
}