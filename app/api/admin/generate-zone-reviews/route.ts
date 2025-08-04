import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { requireAuth } from '../../../../src/lib/auth'

// POST /api/admin/generate-zone-reviews - Generate fake reviews for testing
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    // Get all active properties with zones
    const properties = await prisma.property.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        zones: {
          where: {
            steps: {
              some: {} // Only zones with at least one step
            }
          }
        }
      }
    })

    const reviews = []
    const zoneRatings = []
    const notifications = []

    // Sample reviews data
    const sampleReviews = [
      {
        rating: 5,
        comment: "Excelentes instrucciones, muy claras y fáciles de seguir.",
        userName: "María González"
      },
      {
        rating: 4,
        comment: "Muy útil, aunque podría incluir más detalles sobre algunos aspectos.",
        userName: "Carlos Rodríguez"
      },
      {
        rating: 5,
        comment: "Perfecto! Todo estaba muy bien explicado.",
        userName: "Ana López"
      },
      {
        rating: 4,
        comment: "Buena información, me ayudó mucho durante mi estancia.",
        userName: "Pedro Martín"
      },
      {
        rating: 5,
        comment: "Instrucciones muy detalladas y actualizadas. ¡Excelente!",
        userName: "Laura García"
      }
    ]

    // Generate reviews for each property's zones
    for (const property of properties) {
      for (const zone of property.zones) {
        // Generate 2-4 reviews per zone
        const reviewCount = Math.floor(Math.random() * 3) + 2
        
        for (let i = 0; i < reviewCount; i++) {
          const reviewData = sampleReviews[Math.floor(Math.random() * sampleReviews.length)]
          const rating = Math.floor(Math.random() * 2) + 4 // 4 or 5 stars
          
          // Create zone rating (private feedback)
          zoneRatings.push({
            zoneId: zone.id,
            overallRating: rating,
            clarity: rating,
            completeness: rating,
            helpfulness: rating,
            upToDate: rating,
            feedback: reviewData.comment,
            language: 'es',
            visibleToHost: true,
            visibleToGuests: false,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
          })

          // Create review (can be public)
          const isPublic = Math.random() > 0.3 // 70% chance of being public
          reviews.push({
            propertyId: property.id,
            zoneId: zone.id,
            rating,
            comment: reviewData.comment,
            userName: reviewData.userName,
            reviewType: 'zone',
            isPublic: false, // Start as private, host can make public
            isApproved: false,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          })

          // Create notification for host
          const zoneName = typeof zone.name === 'string' ? zone.name : (zone.name as any)?.es || 'Zona'
          notifications.push({
            userId: property.hostId,
            type: 'evaluation',
            title: 'Nueva evaluación de zona',
            message: `Recibiste una nueva evaluación para la zona "${zoneName}" con ${rating} estrellas`,
            data: {
              zoneId: zone.id,
              zoneName: zone.name,
              propertyId: property.id,
              propertyName: property.name,
              rating,
              feedback: reviewData.comment,
              userName: reviewData.userName
            },
            read: Math.random() > 0.5, // 50% chance of being read
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          })
        }
      }
    }

    // Insert all data
    const createdZoneRatings = await prisma.zoneRating.createMany({
      data: zoneRatings
    })

    const createdReviews = await prisma.review.createMany({
      data: reviews
    })

    const createdNotifications = await prisma.notification.createMany({
      data: notifications
    })

    // Update average ratings for zones
    for (const property of properties) {
      for (const zone of property.zones) {
        const allRatings = await prisma.zoneRating.findMany({
          where: { zoneId: zone.id },
          select: { overallRating: true }
        })

        if (allRatings.length > 0) {
          const avgRating = allRatings.reduce((sum, r) => sum + r.overallRating, 0) / allRatings.length
          
          await prisma.zone.update({
            where: { id: zone.id },
            data: { avgRating }
          })
        }
      }

      // Update property analytics
      const allPropertyZoneRatings = await prisma.zoneRating.findMany({
        where: {
          zone: {
            propertyId: property.id
          }
        },
        select: { overallRating: true }
      })

      if (allPropertyZoneRatings.length > 0) {
        const propertyAvgRating = allPropertyZoneRatings.reduce((sum, r) => sum + r.overallRating, 0) / allPropertyZoneRatings.length
        
        await prisma.propertyAnalytics.upsert({
          where: { propertyId: property.id },
          create: {
            propertyId: property.id,
            overallRating: propertyAvgRating,
            totalRatings: allPropertyZoneRatings.length
          },
          update: {
            overallRating: propertyAvgRating,
            totalRatings: allPropertyZoneRatings.length
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Reseñas de zonas generadas exitosamente',
      data: {
        propertiesProcessed: properties.length,
        zoneRatingsCreated: createdZoneRatings.count,
        reviewsCreated: createdReviews.count,
        notificationsCreated: createdNotifications.count
      }
    })

  } catch (error) {
    console.error('Error generating zone reviews:', error)
    return NextResponse.json(
      { error: 'Error al generar reseñas de zonas' },
      { status: 500 }
    )
  }
}