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

    // For public views, we'll just return success without trying to save to DB
    // This prevents authentication issues from blocking video loading
    console.log('📊 Step viewed:', { propertyId, zoneId, stepIndex, totalSteps })

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
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
        }
      })
      
      // Update analytics asynchronously (don't wait for it)
      updateZoneAnalytics(zoneId, propertyId).catch(console.error)
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

async function updateZoneAnalytics(zoneId: string, propertyId: string) {
  try {
    // Skip analytics update if tables don't exist or RLS blocks access
    console.log('📈 Updating analytics for zone:', zoneId, 'property:', propertyId)
    // For now, just log - don't try to update analytics tables that might not exist
  } catch (error) {
    console.error('Error updating analytics:', error)
  }
}