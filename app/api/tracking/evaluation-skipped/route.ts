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

    // For now, we'll just log the skipped evaluation
    console.log('📊 EVALUATION SKIPPED:', {
      propertyId,
      zoneId,
      reason: reason || 'user_choice',
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'Unknown',
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    })

    // This could be stored in a simple log table or analytics service in the future
    // For now, we track it conceptually without requiring new DB schema

    return NextResponse.json({
      success: true,
      data: {
        message: 'Evaluation skip tracked (logged)',
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error tracking skipped evaluation:', error)
    return NextResponse.json(
      { error: 'Error tracking skipped evaluation' },
      { status: 500 }
    )
  }
}