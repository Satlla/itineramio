import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get all evaluations for this property with user info
    const evaluations = await prisma.review.findMany({
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
      totalEvaluations: evaluations.length,
      averageRating: evaluations.length > 0 
        ? evaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0) / evaluations.length 
        : 0,
      ratingDistribution: {
        5: evaluations.filter(e => e.rating === 5).length,
        4: evaluations.filter(e => e.rating === 4).length,
        3: evaluations.filter(e => e.rating === 3).length,
        2: evaluations.filter(e => e.rating === 2).length,
        1: evaluations.filter(e => e.rating === 1).length,
      },
      publicEvaluations: evaluations.filter(e => e.isPublic).length,
      privateEvaluations: evaluations.filter(e => !e.isPublic).length,
      recentActivity: evaluations.slice(0, 10) // Last 10 evaluations
    }

    return NextResponse.json({
      success: true,
      data: {
        evaluations,
        stats
      }
    })
    
  } catch (error) {
    console.error('Error fetching property evaluations:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener las evaluaciones'
    }, { status: 500 })
  }
}