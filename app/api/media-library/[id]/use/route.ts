import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = 'itineramio-secret-key-2024'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    // Find the media item and verify ownership
    const mediaItem = await prisma.mediaLibrary.findFirst({
      where: {
        id: id,
        userId: userId
      }
    })

    if (!mediaItem) {
      return NextResponse.json(
        { error: 'Archivo de medios no encontrado' },
        { status: 404 }
      )
    }

    // Update usage count and last used timestamp
    const updatedMedia = await prisma.mediaLibrary.update({
      where: { id: id },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedMedia
    })

  } catch (error) {
    console.error('Error updating media usage:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}