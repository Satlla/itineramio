import { NextRequest, NextResponse } from 'next/server'
import * as jwt from 'jsonwebtoken'
import { prisma } from '../../../../src/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'itineramio-secret-key-2024'

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const userId = decoded.userId

    // Get recent evaluations from both Review and ZoneRating tables
    const [recentReviews, recentZoneRatings] = await Promise.all([
      prisma.review.findMany({
        where: {
          property: {
            hostId: userId
          }
        },
        include: {
          property: {
            select: {
              name: true
            }
          },
          zone: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20 // Get more to combine later
      }),
      
      prisma.zoneRating.findMany({
        where: {
          zone: {
            property: {
              hostId: userId
            }
          }
        },
        include: {
          zone: {
            select: {
              name: true,
              property: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20 // Get more to combine later
      })
    ])

    // Format activity data from both reviews and zone ratings
    const reviewActivities = recentReviews.map(review => {
      const propertyName = typeof review.property.name === 'string' 
        ? review.property.name 
        : (review.property.name as any)?.es || 'Propiedad'
      
      const zoneName = review.zone 
        ? (typeof review.zone.name === 'string' 
            ? review.zone.name 
            : (review.zone.name as any)?.es || 'Zona')
        : null

      const timeAgo = getTimeAgo(review.createdAt)
      
      return {
        id: `review-${review.id}`,
        type: 'evaluation',
        message: zoneName 
          ? `${review.userName} dejó una evaluación de ${review.rating} estrellas en ${zoneName} de ${propertyName}`
          : `${review.userName} dejó una evaluación general de ${review.rating} estrellas en ${propertyName}`,
        time: timeAgo,
        avatar: null,
        property: propertyName,
        zone: zoneName,
        rating: review.rating,
        isPublic: review.isPublic,
        createdAt: review.createdAt,
        comment: review.comment
      }
    })

    const zoneRatingActivities = recentZoneRatings.map(rating => {
      const propertyName = rating.zone.property ? 
        (typeof rating.zone.property.name === 'string' 
          ? rating.zone.property.name 
          : (rating.zone.property.name as any)?.es || 'Propiedad')
        : 'Propiedad'
      
      const zoneName = typeof rating.zone.name === 'string' 
        ? rating.zone.name 
        : (rating.zone.name as any)?.es || 'Zona'

      const timeAgo = getTimeAgo(rating.createdAt)
      
      return {
        id: `zonerating-${rating.id}`,
        type: 'evaluation',
        message: `Usuario anónimo dejó una evaluación de ${rating.overallRating} estrellas en ${zoneName} de ${propertyName}`,
        time: timeAgo,
        avatar: null,
        property: propertyName,
        zone: zoneName,
        rating: rating.overallRating,
        isPublic: false,
        createdAt: rating.createdAt,
        feedback: rating.feedback
      }
    })

    // Combine and sort all activities by creation date
    const allActivities = [...reviewActivities, ...zoneRatingActivities]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10) // Take the 10 most recent

    const activity = allActivities

    return NextResponse.json({
      success: true,
      activity
    })

  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener la actividad reciente'
    }, { status: 500 })
  }
}

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) {
    return 'hace un momento'
  } else if (minutes < 60) {
    return `hace ${minutes} minuto${minutes === 1 ? '' : 's'}`
  } else if (hours < 24) {
    return `hace ${hours} hora${hours === 1 ? '' : 's'}`
  } else {
    return `hace ${days} día${days === 1 ? '' : 's'}`
  }
}