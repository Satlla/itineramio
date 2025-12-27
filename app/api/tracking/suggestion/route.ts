import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { propertyId, suggestion, timestamp } = await request.json()

    // Validate required fields
    if (!propertyId || !suggestion) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const userAgent = request.headers.get('user-agent') || undefined
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined

    // Save to database
    await prisma.trackingEvent.create({
      data: {
        type: 'SUGGESTION',
        propertyId,
        metadata: {
          suggestion
        },
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        userAgent,
        ipAddress
      }
    })

    console.log('💡 SUGGESTION saved:', { propertyId, suggestion })

    return NextResponse.json({
      success: true,
      message: 'Suggestion submitted successfully'
    })
  } catch (error) {
    console.error('Error submitting suggestion:', error)
    return NextResponse.json(
      { error: 'Failed to submit suggestion' },
      { status: 500 }
    )
  }
}