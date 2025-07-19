import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

// GET /api/test-evaluation-simple - Simple test to verify evaluation system
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing evaluation system...')
    
    // 1. Check if we can access the database
    const notificationCount = await prisma.notification.count()
    console.log(`📊 Current notifications in DB: ${notificationCount}`)
    
    // 2. Check zone ratings
    const zoneRatingCount = await prisma.zoneRating.count()
    console.log(`📊 Current zone ratings in DB: ${zoneRatingCount}`)
    
    // 3. Check reviews
    const reviewCount = await prisma.review.count()
    console.log(`📊 Current reviews in DB: ${reviewCount}`)
    
    // 4. Get a sample property with zones
    const propertyWithZones = await prisma.property.findFirst({
      where: {
        zones: {
          some: {}
        }
      },
      include: {
        zones: {
          take: 1
        }
      }
    })
    
    if (!propertyWithZones || propertyWithZones.zones.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No properties with zones found to test'
      })
    }
    
    const testProperty = propertyWithZones
    const testZone = propertyWithZones.zones[0]
    
    console.log(`🏠 Testing with property: ${testProperty.name} (${testProperty.id})`)
    console.log(`📍 Testing with zone: ${testZone.name} (${testZone.id})`)
    
    // 5. Create a test evaluation
    const testData = {
      propertyId: testProperty.id,
      zoneId: testZone.id,
      rating: 4,
      comment: `Test evaluation created at ${new Date().toISOString()}`,
      userName: 'Sistema de Prueba',
      reviewType: 'zone',
      clarity: 5,
      completeness: 4,
      helpfulness: 4,
      upToDate: 5
    }
    
    // Create evaluation using the API
    const response = await fetch(`${request.url.replace('/test-evaluation-simple', '/evaluations/create')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })
    
    const result = await response.json()
    
    // 6. Check if notification was created
    const newNotificationCount = await prisma.notification.count()
    const notificationsCreated = newNotificationCount - notificationCount
    
    // 7. Check if zone rating was created
    const newZoneRatingCount = await prisma.zoneRating.count()
    const zoneRatingsCreated = newZoneRatingCount - zoneRatingCount
    
    // 8. Get the created notification
    const latestNotification = await prisma.notification.findFirst({
      where: {
        userId: testProperty.hostId,
        type: 'ZONE_EVALUATION_RECEIVED'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({
      success: true,
      test: {
        property: {
          id: testProperty.id,
          name: testProperty.name,
          hostId: testProperty.hostId
        },
        zone: {
          id: testZone.id,
          name: testZone.name
        },
        evaluationCreated: result.success,
        evaluationResponse: result,
        notificationsCreated,
        zoneRatingsCreated,
        latestNotification: latestNotification ? {
          id: latestNotification.id,
          type: latestNotification.type,
          title: latestNotification.title,
          message: latestNotification.message,
          read: latestNotification.read,
          createdAt: latestNotification.createdAt
        } : null
      }
    })
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}