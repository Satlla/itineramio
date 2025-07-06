import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get all public evaluations for this property
    const evaluations = await prisma.review.findMany({
      where: {
        propertyId: id,
        isPublic: true,
        comment: {
          not: null // Only include evaluations with comments for public display
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

    // Calculate statistics for public evaluations only
    const stats = {
      totalEvaluations: evaluations.length,
      averageRating: evaluations.length > 0 
        ? evaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0) / evaluations.length 
        : 0
    }

    return NextResponse.json({
      success: true,
      evaluations: evaluations.map(evaluation => ({
        id: evaluation.id,
        rating: evaluation.rating,
        comment: evaluation.comment,
        userName: evaluation.userName,
        createdAt: evaluation.createdAt,
        reviewType: evaluation.reviewType,
        zone: evaluation.zone
      })),
      stats
    })
    
  } catch (error) {
    console.error('Error fetching public evaluations:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener las evaluaciones públicas'
    }, { status: 500 })
  }
}