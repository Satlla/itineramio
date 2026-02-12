import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../src/lib/admin-auth'

// POST /api/cleanup/fake-evaluations - Remove fake/test evaluations from public view
// ADMIN ONLY - This is a destructive operation
export async function POST(request: NextRequest) {
  try {
    // Check ADMIN authentication (not regular user)
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    console.log('🧹 Starting cleanup of fake evaluations...')
    
    // Delete fake zone ratings (test data)
    const deletedZoneRatings = await prisma.zoneRating.deleteMany({
      where: {
        OR: [
          { feedback: { contains: 'test' } },
          { feedback: { contains: 'prueba' } },
          { feedback: { contains: 'Test' } },
          { feedback: { contains: 'ejemplo' } },
          { feedback: { contains: 'fake' } },
          { feedback: { contains: 'demo' } },
          { improvementSuggestions: { contains: 'test' } },
          { improvementSuggestions: { contains: 'prueba' } },
          { guestCountry: 'Test Country' },
          { guestAgeRange: 'Test' }
        ]
      }
    })
    
    // Delete fake reviews
    const deletedReviews = await prisma.review.deleteMany({
      where: {
        OR: [
          { comment: { contains: 'test' } },
          { comment: { contains: 'prueba' } },
          { comment: { contains: 'Test' } },
          { comment: { contains: 'ejemplo' } },
          { comment: { contains: 'fake' } },
          { comment: { contains: 'demo' } },
          { userName: { contains: 'Test' } },
          { userName: { contains: 'Prueba' } },
          { userName: { contains: 'Usuario de Prueba' } },
          { userName: { contains: 'Sistema de Prueba' } },
          { userName: { contains: 'test' } },
          { userEmail: { contains: 'test@' } },
          { userEmail: { contains: 'example.com' } }
        ]
      }
    })
    
    // Delete test notifications
    const deletedNotifications = await prisma.notification.deleteMany({
      where: {
        OR: [
          { message: { contains: 'test' } },
          { message: { contains: 'prueba' } },
          { message: { contains: 'Test' } },
          { title: { contains: 'test' } },
          { title: { contains: 'Test' } }
        ]
      }
    }).catch(() => ({ count: 0 })) // Ignore if notification table doesn't exist
    
    console.log('🧹 Cleanup completed:', {
      deletedZoneRatings: deletedZoneRatings.count,
      deletedReviews: deletedReviews.count,
      deletedNotifications: deletedNotifications.count
    })
    
    return NextResponse.json({
      success: true,
      message: 'Fake evaluations cleaned up successfully',
      deleted: {
        zoneRatings: deletedZoneRatings.count,
        reviews: deletedReviews.count,
        notifications: deletedNotifications.count,
        total: deletedZoneRatings.count + deletedReviews.count
      }
    })
    
  } catch (error) {
    console.error('Error cleaning up fake evaluations:', error)
    return NextResponse.json({
      error: 'Failed to cleanup fake evaluations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}