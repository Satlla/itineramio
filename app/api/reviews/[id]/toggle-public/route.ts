import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../../src/lib/prisma'

const JWT_SECRET = 'itineramio-secret-key-2024'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get user from JWT token (property owner authorization)
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const userId = decoded.userId

    // Get the review and verify ownership
    const review = await prisma.review.findFirst({
      where: { id },
      include: {
        property: {
          select: {
            hostId: true,
            name: true
          }
        }
      }
    })

    if (!review) {
      return NextResponse.json({
        success: false,
        error: 'Reseña no encontrada'
      }, { status: 404 })
    }

    // Verify that the user owns the property
    if (review.property.hostId !== userId) {
      return NextResponse.json({
        success: false,
        error: 'No tienes permisos para modificar esta reseña'
      }, { status: 403 })
    }

    // Toggle public status
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        isPublic: !review.isPublic,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedReview,
      message: `Reseña ${updatedReview.isPublic ? 'publicada' : 'marcada como privada'} correctamente`
    })
    
  } catch (error) {
    console.error('Error toggling review visibility:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al cambiar la visibilidad de la reseña'
    }, { status: 500 })
  }
}