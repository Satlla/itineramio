import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * PUT /api/gestion/properties/[propertyId]/image
 * Update property profile image
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    const { propertyId } = await params

    // Verify property belongs to user
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        hostId: userId
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { profileImage } = body

    // Update property profile image
    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: { profileImage: profileImage || null }
    })

    return NextResponse.json({
      success: true,
      property: {
        id: updated.id,
        profileImage: updated.profileImage
      }
    })
  } catch (error) {
    console.error('Error updating property image:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
