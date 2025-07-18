import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

// POST /api/properties/[propertyId]/evaluate - Submit manual evaluation (can be public)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params
    const body = await request.json()

    const { 
      rating, 
      comment, 
      userName = 'Usuario anónimo',
      userEmail,
      isPublic = false, // User can choose if they want their review to be public
      language = 'es',
      ipAddress
    } = body

    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Calificación requerida (1-5 estrellas)' },
        { status: 400 }
      )
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        hostId: true,
        hostContactName: true,
        name: true
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    // Create manual evaluation (Review model)
    const review = await prisma.review.create({
      data: {
        propertyId,
        rating,
        comment,
        userName,
        userEmail,
        reviewType: 'property', // This is a full manual evaluation
        isPublic: false, // Always starts as private, host can make it public later
        isApproved: false, // Requires host approval to be public
        emailSent: false
      }
    })

    // Create notification for host about new manual evaluation
    await prisma.notification.create({
      data: {
        userId: property.hostId,
        type: 'MANUAL_EVALUATION_RECEIVED',
        title: 'Nueva evaluación del manual',
        message: `${userName} evaluó tu manual completo con ${rating} estrellas${comment ? ': "' + comment.substring(0, 50) + '..."' : ''}`,
        data: {
          reviewId: review.id,
          propertyId: property.id,
          propertyName: property.name,
          rating,
          comment,
          userName,
          canBePublic: isPublic, // User's preference about publicity
        }
      }
    })

    // Update property's average rating
    const allReviews = await prisma.review.findMany({
      where: { 
        propertyId,
        reviewType: 'property' // Only count manual evaluations, not zone-specific reviews
      },
      select: { rating: true }
    })

    if (allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      
      // Update property analytics
      await prisma.propertyAnalytics.upsert({
        where: { propertyId },
        create: {
          propertyId,
          overallRating: avgRating,
          totalRatings: allReviews.length
        },
        update: {
          overallRating: avgRating,
          totalRatings: allReviews.length
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Evaluación del manual enviada correctamente',
      data: {
        id: review.id,
        rating,
        canBePublic: isPublic
      }
    })

  } catch (error) {
    console.error('Error submitting manual evaluation:', error)
    return NextResponse.json(
      { error: 'Error al enviar la evaluación del manual' },
      { status: 500 }
    )
  }
}

// GET /api/properties/[propertyId]/evaluate - Get manual evaluations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const onlyPublic = searchParams.get('public') === 'true'
    const skip = (page - 1) * limit

    const whereClause = {
      propertyId,
      reviewType: 'property',
      ...(onlyPublic && { 
        isPublic: true,
        isApproved: true 
      })
    }

    // Get manual evaluations with pagination
    const reviews = await prisma.review.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        rating: true,
        comment: true,
        userName: true,
        isPublic: true,
        isApproved: true,
        hostResponse: true,
        hostRespondedAt: true,
        createdAt: true,
        // Don't expose email unless it's for the host dashboard
        ...(onlyPublic ? {} : { userEmail: true })
      }
    })

    const total = await prisma.review.count({
      where: whereClause
    })

    // Calculate statistics
    const stats = await prisma.review.aggregate({
      where: {
        propertyId,
        reviewType: 'property'
      },
      _avg: {
        rating: true
      },
      _count: {
        id: true
      }
    })

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        propertyId,
        reviewType: 'property',
        ...(onlyPublic && { 
          isPublic: true,
          isApproved: true 
        })
      },
      _count: {
        rating: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: {
          total: stats._count.id,
          avgRating: stats._avg.rating || 0,
          distribution: ratingDistribution.reduce((acc, item) => {
            acc[item.rating] = item._count.rating
            return acc
          }, {} as Record<number, number>)
        }
      }
    })

  } catch (error) {
    console.error('Error fetching manual evaluations:', error)
    return NextResponse.json(
      { error: 'Error al obtener las evaluaciones del manual' },
      { status: 500 }
    )
  }
}