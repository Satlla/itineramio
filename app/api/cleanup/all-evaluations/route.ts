import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { requireAuth } from '../../../../src/lib/auth'

// POST /api/cleanup/all-evaluations - Remove ALL evaluations (nuclear option)
export async function POST(request: NextRequest) {
  try {
    // Check authentication (admin only)
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    console.log('🚨 Starting NUCLEAR cleanup - removing ALL evaluations...')
    
    // Delete ALL zone ratings
    const deletedZoneRatings = await prisma.zoneRating.deleteMany({})
    
    // Delete ALL reviews
    const deletedReviews = await prisma.review.deleteMany({})
    
    // Delete ALL evaluation-related notifications
    const deletedNotifications = await prisma.notification.deleteMany({
      where: {
        OR: [
          { type: 'ZONE_EVALUATION_RECEIVED' },
          { type: 'MANUAL_EVALUATION_RECEIVED' }
        ]
      }
    }).catch(() => ({ count: 0 })) // Ignore if notification table doesn't exist
    
    console.log('🚨 NUCLEAR cleanup completed:', {
      deletedZoneRatings: deletedZoneRatings.count,
      deletedReviews: deletedReviews.count,
      deletedNotifications: deletedNotifications.count
    })
    
    return NextResponse.json({
      success: true,
      message: 'ALL evaluations removed successfully',
      deleted: {
        zoneRatings: deletedZoneRatings.count,
        reviews: deletedReviews.count,
        notifications: deletedNotifications.count,
        total: deletedZoneRatings.count + deletedReviews.count
      }
    })
    
  } catch (error) {
    console.error('Error in nuclear cleanup:', error)
    return NextResponse.json({
      error: 'Failed to perform nuclear cleanup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}