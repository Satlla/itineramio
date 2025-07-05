import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get all public reviews for this property
    const reviews = await prisma.review.findMany({
      where: {
        propertyId: id,
        isPublic: true,
        comment: {
          not: null // Only include reviews with comments for public display
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
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate statistics for public reviews only
    const stats = {
      totalReviews: reviews.length,
      averageRating: reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0
    }

    return NextResponse.json({
      success: true,
      reviews: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        userName: review.userName,
        createdAt: review.createdAt,
        reviewType: review.reviewType,
        zone: review.zone
      })),
      stats
    })
    
  } catch (error) {
    console.error('Error fetching public reviews:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener las reseñas públicas'
    }, { status: 500 })
  }
}