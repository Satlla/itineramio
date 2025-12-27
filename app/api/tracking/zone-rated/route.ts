import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { propertyId, zoneId, rating, comment, timestamp } = await request.json()

    // Validate required fields
    if (!propertyId || !zoneId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Missing required fields or invalid rating' },
        { status: 400 }
      )
    }

    const userAgent = request.headers.get('user-agent') || undefined
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined

    // Save to database
    await prisma.trackingEvent.create({
      data: {
        type: 'ZONE_RATED',
        propertyId,
        zoneId,
        metadata: {
          rating,
          comment: comment || null
        },
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        userAgent,
        ipAddress
      }
    })

    console.log('⭐ ZONE_RATED saved:', { propertyId, zoneId, rating })

    return NextResponse.json({
      success: true,
      message: 'Zone rating tracked successfully'
    })
  } catch (error) {
    console.error('Error tracking zone rating:', error)
    return NextResponse.json(
      { error: 'Failed to track zone rating' },
      { status: 500 }
    )
  }
}