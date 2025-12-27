import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../../src/lib/auth'

// GET /api/properties/[id]/evaluations/enhanced - Get all evaluations for a property (zones + property)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Check property ownership
    const property = await prisma.property.findFirst({
      where: {
        id,
        hostId: userId
      },
      select: {
        id: true,
        name: true
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada o no tienes permisos' },
        { status: 404 }
      )
    }

    // Get zone evaluations (from zoneRating and review tables)
    const zoneEvaluations = await prisma.review.findMany({
      where: {
        propertyId: id,
        reviewType: 'zone',
        zoneId: { not: null }
      },
      include: {
        zone: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get property evaluations (full manual reviews)
    const propertyEvaluations = await prisma.review.findMany({
      where: {
        propertyId: id,
        reviewType: 'property'
      },
      orderBy: { createdAt: 'desc' }
    })

    // Format zone evaluations
    const formattedZoneEvaluations = zoneEvaluations.map(evaluation => ({
      id: evaluation.id,
      type: 'zone' as const,
      rating: evaluation.rating,
      comment: evaluation.comment,
      userName: evaluation.userName,
      userEmail: evaluation.userEmail,
      createdAt: evaluation.createdAt.toISOString(),
      isPublic: evaluation.isPublic,
      isApproved: evaluation.isApproved,
      zoneId: evaluation.zoneId,
      zoneName: typeof evaluation.zone?.name === 'string' 
        ? evaluation.zone.name 
        : (evaluation.zone?.name as any)?.es || 'Zona',
      propertyId: evaluation.propertyId,
      propertyName: typeof property.name === 'string' 
        ? property.name 
        : (property.name as any)?.es || 'Propiedad'
    }))

    // Format property evaluations
    const formattedPropertyEvaluations = propertyEvaluations.map(evaluation => ({
      id: evaluation.id,
      type: 'property' as const,
      rating: evaluation.rating,
      comment: evaluation.comment,
      userName: evaluation.userName,
      userEmail: evaluation.userEmail,
      createdAt: evaluation.createdAt.toISOString(),
      isPublic: evaluation.isPublic,
      isApproved: evaluation.isApproved,
      propertyId: evaluation.propertyId,
      propertyName: typeof property.name === 'string' 
        ? property.name 
        : (property.name as any)?.es || 'Propiedad'
    }))

    // Combine and sort by date
    const allEvaluations = [
      ...formattedZoneEvaluations,
      ...formattedPropertyEvaluations
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      success: true,
      data: allEvaluations,
      stats: {
        total: allEvaluations.length,
        zoneEvaluations: formattedZoneEvaluations.length,
        propertyEvaluations: formattedPropertyEvaluations.length,
        publicEvaluations: allEvaluations.filter(e => e.isPublic).length,
        averageRating: allEvaluations.length > 0 
          ? allEvaluations.reduce((sum, e) => sum + e.rating, 0) / allEvaluations.length 
          : 0
      }
    })

  } catch (error) {
    console.error('Error fetching property evaluations:', error)
    return NextResponse.json(
      { error: 'Error al obtener evaluaciones' },
      { status: 500 }
    )
  }
}