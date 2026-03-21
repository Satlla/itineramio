import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { zoneId, propertyId, reason } = body

    if (!zoneId || !propertyId) {
      return NextResponse.json(
        { error: 'Zone ID and Property ID are required' },
        { status: 400 }
      )
    }

    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const visitorIp = ip.split(',')[0].trim()

    await prisma.trackingEvent.create({
      data: {
        type: 'EVALUATION_SKIPPED',
        propertyId,
        zoneId,
        metadata: { reason: reason || 'user_choice' },
        timestamp: new Date(),
        userAgent,
        ipAddress: visitorIp
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        message: 'Evaluation skip tracked',
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error tracking skipped evaluation' },
      { status: 500 }
    )
  }
}