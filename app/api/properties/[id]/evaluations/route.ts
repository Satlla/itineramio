import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../src/lib/auth'

// GET /api/properties/[propertyId]/evaluations - Get all evaluations for a property (for host dashboard)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Verify user owns the property
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        hostId: userId
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada o no autorizada' },
        { status: 404 }
      )
    }

    // Get all evaluations for this property (both zone and property reviews)
    // First get Reviews (manual evaluations and zone reviews)
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
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    // Get Zone Ratings (private zone evaluations)
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
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    // Transform data to match the interface expected by the frontend
    const transformedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      userName: review.userName,
      userEmail: review.userEmail,
      reviewType: review.reviewType as 'zone' | 'property',
      isPublic: review.isPublic,
      isApproved: review.isApproved,
      hostResponse: review.hostResponse,
      hostRespondedAt: review.hostRespondedAt?.toISOString(),
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
      zone: review.zone ? {
        id: review.zone.id,
        name: typeof review.zone.name === 'string' ? review.zone.name : (review.zone.name as any)?.es || 'Zona',
        icon: review.zone.icon
      } : undefined
    }))

    // Transform zone ratings to match interface (these are always private)
    const transformedZoneRatings = zoneRatings.map(rating => ({
      id: rating.id,
      rating: rating.overallRating,
      comment: rating.feedback || rating.improvementSuggestions,
      userName: 'Usuario anónimo',
      userEmail: undefined,
      reviewType: 'zone' as const,
      isPublic: false, // Zone ratings are always private
      isApproved: false,
      hostResponse: undefined,
      hostRespondedAt: undefined,
      createdAt: rating.createdAt.toISOString(),
      updatedAt: rating.createdAt.toISOString(),
      zone: {
        id: rating.zone.id,
        name: typeof rating.zone.name === 'string' ? rating.zone.name : (rating.zone.name as any)?.es || 'Zona',
        icon: rating.zone.icon
      },
      // Include additional rating details
      clarity: rating.clarity,
      completeness: rating.completeness,
      helpfulness: rating.helpfulness,
      upToDate: rating.upToDate,
      language: rating.language,
      guestInfo: {
        ageRange: rating.guestAgeRange,
        country: rating.guestCountry,
        travelType: rating.guestTravelType
      }
    }))

    // Combine and sort all evaluations
    const allEvaluations = [...transformedReviews, ...transformedZoneRatings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Calculate statistics
    const totalEvaluations = allEvaluations.length
    const averageRating = totalEvaluations > 0 
      ? allEvaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0) / totalEvaluations 
      : 0

    // Calculate rating distribution
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    allEvaluations.forEach(evaluation => {
      ratingDistribution[evaluation.rating as keyof typeof ratingDistribution]++
    })

    const publicEvaluations = allEvaluations.filter(evaluation => evaluation.isPublic).length
    const privateEvaluations = totalEvaluations - publicEvaluations

    const stats = {
      totalEvaluations,
      averageRating,
      ratingDistribution,
      publicEvaluations,
      privateEvaluations,
      recentActivity: allEvaluations.slice(0, 5) // Last 5 for recent activity
    }

    return NextResponse.json({
      success: true,
      data: {
        evaluations: allEvaluations,
        stats,
        pagination: {
          page,
          limit,
          total: totalEvaluations,
          pages: Math.ceil(totalEvaluations / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error fetching property evaluations:', error)
    return NextResponse.json(
      { error: 'Error al obtener las evaluaciones' },
      { status: 500 }
    )
  }
}