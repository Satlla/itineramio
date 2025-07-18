import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../src/lib/auth'

// PATCH /api/evaluations/[evaluationId]/toggle-public - Toggle evaluation visibility
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ evaluationId: string }> }
) {
  try {
    const { evaluationId } = await params

    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Find the review and verify ownership
    const review = await prisma.review.findUnique({
      where: { id: evaluationId },
      include: {
        property: {
          select: {
            hostId: true,
            name: true
          }
        },
        zone: {
          select: {
            name: true
          }
        }
      }
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Evaluación no encontrada' },
        { status: 404 }
      )
    }

    // Verify the user owns the property
    if (review.property.hostId !== userId) {
      return NextResponse.json(
        { error: 'No tienes permisos para modificar esta evaluación' },
        { status: 403 }
      )
    }

    // Note: Zone ratings (ZoneRating model) are always private and cannot be made public
    // Only Reviews can be toggled public/private

    // Toggle the public status
    const updatedReview = await prisma.review.update({
      where: { id: evaluationId },
      data: { 
        isPublic: !review.isPublic,
        isApproved: !review.isPublic // If making public, auto-approve it
      }
    })

    return NextResponse.json({
      success: true,
      message: updatedReview.isPublic 
        ? 'Evaluación ahora es pública'
        : 'Evaluación ahora es privada',
      data: {
        id: updatedReview.id,
        isPublic: updatedReview.isPublic,
        isApproved: updatedReview.isApproved
      }
    })

  } catch (error) {
    console.error('Error toggling evaluation visibility:', error)
    return NextResponse.json(
      { error: 'Error al cambiar la visibilidad de la evaluación' },
      { status: 500 }
    )
  }
}