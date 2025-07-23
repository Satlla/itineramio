import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../src/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: evaluationId } = await params

    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Get the evaluation and verify ownership
    const evaluation = await prisma.review.findUnique({
      where: { id: evaluationId },
      include: {
        property: {
          select: {
            hostId: true,
            name: true
          }
        }
      }
    })

    if (!evaluation) {
      return NextResponse.json(
        { error: 'Evaluación no encontrada' },
        { status: 404 }
      )
    }

    // Verify user owns the property
    if (evaluation.property?.hostId !== userId) {
      return NextResponse.json(
        { error: 'No autorizado para aprobar esta evaluación' },
        { status: 403 }
      )
    }

    // Toggle approval status
    const updatedEvaluation = await prisma.review.update({
      where: { id: evaluationId },
      data: {
        isApproved: !evaluation.isApproved
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedEvaluation,
      message: updatedEvaluation.isApproved 
        ? 'Evaluación aprobada exitosamente' 
        : 'Aprobación de evaluación removida'
    })

  } catch (error) {
    console.error('Error approving evaluation:', error)
    return NextResponse.json(
      { error: 'Error al aprobar la evaluación' },
      { status: 500 }
    )
  }
}