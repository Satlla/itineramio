import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../src/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ratingId: string }> }
) {
  try {
    const { ratingId } = await params

    // Get user from JWT token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const userId = decoded.userId

    // Get rating and verify ownership
    const rating = await prisma.propertyRating.findFirst({
      where: { 
        id: ratingId,
        property: {
          hostId: userId
        }
      },
      include: {
        property: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!rating) {
      return NextResponse.json({
        success: false,
        error: 'Evaluación no encontrada'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: rating
    })

  } catch (error) {
    console.error('Error fetching rating:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ratingId: string }> }
) {
  try {
    const { ratingId } = await params
    const { action } = await request.json()

    // Get user from JWT token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const userId = decoded.userId

    // Verify rating belongs to user's property
    const rating = await prisma.propertyRating.findFirst({
      where: { 
        id: ratingId,
        property: {
          hostId: userId
        }
      }
    })

    if (!rating) {
      return NextResponse.json({
        success: false,
        error: 'Evaluación no encontrada'
      }, { status: 404 })
    }

    let newStatus: string
    let message: string

    switch (action) {
      case 'approve':
        newStatus = 'APPROVED'
        message = 'Evaluación aprobada y publicada'
        break
      case 'reject':
        newStatus = 'REJECTED'
        message = 'Evaluación rechazada'
        break
      default:
        return NextResponse.json({
          success: false,
          error: 'Acción no válida'
        }, { status: 400 })
    }

    // Update rating status
    await prisma.propertyRating.update({
      where: { id: ratingId },
      data: { 
        status: newStatus,
        reviewedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message,
      data: { status: newStatus }
    })

  } catch (error) {
    console.error('Error updating rating:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}