import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../src/lib/admin-auth'

// POST /api/cleanup/all-evaluations - Remove ALL evaluations (nuclear option)
// ADMIN ONLY - This is a destructive operation
export async function POST(request: NextRequest) {
  try {
    // Check ADMIN authentication (not regular user)
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    
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
    return NextResponse.json({
      error: 'Failed to perform nuclear cleanup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}