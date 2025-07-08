import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = 'itineramio-secret-key-2024'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let userId: string
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      userId = decoded.userId
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Get the evaluation to check if user owns the property
    const evaluation = await prisma.review.findFirst({
      where: { id },
      include: {
        property: {
          select: { hostId: true }
        }
      }
    })

    if (!evaluation) {
      return NextResponse.json({
        success: false,
        error: 'Evaluación no encontrada'
      }, { status: 404 })
    }

    // Check if user is the property owner
    if (evaluation.property.hostId !== userId) {
      return NextResponse.json({
        success: false,
        error: 'No tienes permisos para modificar esta evaluación'
      }, { status: 403 })
    }

    // Update evaluation
    const updateData: any = {}
    
    if (body.isApproved !== undefined) {
      updateData.isApproved = body.isApproved
    }
    
    if (body.hostResponse !== undefined) {
      updateData.hostResponse = body.hostResponse
      updateData.hostRespondedAt = new Date()
    }

    const updatedEvaluation = await prisma.review.update({
      where: { id },
      data: updateData,
      include: {
        zone: {
          select: {
            id: true,
            name: true,
            icon: true
          }
        },
        property: {
          select: {
            name: true,
            hostId: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedEvaluation,
      message: 'Evaluación actualizada correctamente'
    })
    
  } catch (error) {
    console.error('Error updating evaluation:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al actualizar la evaluación'
    }, { status: 500 })
  }
}