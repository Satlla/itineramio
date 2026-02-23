import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'

// GET /api/public/properties/[id]/evaluations - Get public evaluations for a property
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get property to check if it exists, is active, and is published
    const property = await prisma.property.findFirst({
      where: {
        id,
        status: 'ACTIVE',
        isPublished: true,
        deletedAt: null
      },
      select: {
        id: true,
        name: true
      }
    })

    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada o no publicada'
      }, { status: 404 })
    }

    // Get public zone evaluations
    const zoneEvaluations = await prisma.review.findMany({
      where: {
        propertyId: id,
        reviewType: 'zone',
        isPublic: true,
        isApproved: true
      },
      include: {
        zone: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to most recent 50
    })

    // Get public property evaluations  
    const propertyEvaluations = await prisma.review.findMany({
      where: {
        propertyId: id,
        reviewType: 'property',
        isPublic: true,
        isApproved: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to most recent 50
    })

    // Format evaluations
    const formattedZoneEvaluations = zoneEvaluations.map(evaluation => ({
      id: evaluation.id,
      type: 'zone' as const,
      rating: evaluation.rating,
      comment: evaluation.comment,
      userName: evaluation.userName,
      createdAt: evaluation.createdAt.toISOString(),
      zoneName: typeof evaluation.zone?.name === 'string' 
        ? evaluation.zone.name 
        : (evaluation.zone?.name as any)?.es || 'Zona'
    }))

    const formattedPropertyEvaluations = propertyEvaluations.map(evaluation => ({
      id: evaluation.id,
      type: 'property' as const,
      rating: evaluation.rating,
      comment: evaluation.comment,
      userName: evaluation.userName,
      createdAt: evaluation.createdAt.toISOString()
    }))

    // Combine and sort by date
    const allEvaluations = [
      ...formattedZoneEvaluations,
      ...formattedPropertyEvaluations
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Calculate average rating
    const averageRating = allEvaluations.length > 0 
      ? allEvaluations.reduce((sum, e) => sum + e.rating, 0) / allEvaluations.length 
      : 0

    return NextResponse.json({
      success: true,
      data: {
        evaluations: allEvaluations,
        stats: {
          total: allEvaluations.length,
          zoneEvaluations: formattedZoneEvaluations.length,
          propertyEvaluations: formattedPropertyEvaluations.length,
          averageRating: Math.round(averageRating * 10) / 10
        }
      }
    })

  } catch (error) {
    console.error('Error fetching public evaluations:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener evaluaciones'
    }, { status: 500 })
  }
}