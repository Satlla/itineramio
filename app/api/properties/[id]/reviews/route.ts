import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get all reviews for this property with user info
    const reviews = await prisma.review.findMany({
      where: {
        propertyId: id
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

    // Calculate property statistics
    const stats = {
      totalReviews: reviews.length,
      averageRating: reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0,
      ratingDistribution: {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
      },
      publicReviews: reviews.filter(r => r.isPublic).length,
      privateReviews: reviews.filter(r => !r.isPublic).length,
      recentActivity: reviews.slice(0, 10) // Last 10 reviews
    }

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        stats
      }
    })
    
  } catch (error) {
    console.error('Error fetching property reviews:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener las reseñas'
    }, { status: 500 })
  }
}