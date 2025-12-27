import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

// GET /api/debug-evaluations/[propertyId] - Debug evaluations for a property
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params
    
    console.log('🔍 Debug: Fetching evaluations for property:', propertyId)
    
    // Get property info
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        name: true,
        hostId: true
      }
    })
    
    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Property not found',
        propertyId
      }, { status: 404 })
    }
    
    // Get all reviews for this property
    const reviews = await prisma.review.findMany({
      where: { propertyId },
      include: {
        zone: {
          select: {
            id: true,
            name: true,
            icon: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Get all zone ratings for this property
    const zoneRatings = await prisma.zoneRating.findMany({
      where: {
        zone: {
          propertyId: propertyId
        }
      },
      include: {
        zone: {
          select: {
            id: true,
            name: true,
            icon: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Get notifications for this property
    const notifications = await prisma.notification.findMany({
      where: {
        userId: property.hostId,
        OR: [
          { type: 'ZONE_EVALUATION_RECEIVED' },
          { type: 'MANUAL_EVALUATION_RECEIVED' }
        ],
        data: {
          path: ['propertyId'],
          equals: propertyId
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    
    // Count unread notifications
    const unreadCount = notifications.filter(n => !n.read).length
    
    return NextResponse.json({
      success: true,
      property: {
        id: property.id,
        name: property.name,
        hostId: property.hostId
      },
      evaluations: {
        reviews: {
          count: reviews.length,
          data: reviews.map(r => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            userName: r.userName,
            zone: r.zone?.name,
            isPublic: r.isPublic,
            createdAt: r.createdAt
          }))
        },
        zoneRatings: {
          count: zoneRatings.length,
          data: zoneRatings.map(zr => ({
            id: zr.id,
            overallRating: zr.overallRating,
            feedback: zr.feedback,
            zone: zr.zone.name,
            createdAt: zr.createdAt
          }))
        },
        total: reviews.length + zoneRatings.length
      },
      notifications: {
        total: notifications.length,
        unread: unreadCount,
        recent: notifications.slice(0, 5).map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          read: n.read,
          createdAt: n.createdAt
        }))
      }
    })
    
  } catch (error) {
    console.error('Debug evaluations error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}