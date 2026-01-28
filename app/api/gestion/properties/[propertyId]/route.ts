import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * PATCH /api/gestion/properties/[propertyId]
 * Update property basic info (name, city)
 */
export async function PATCH(
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
    const body = await request.json()

    // Verify ownership
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

    // Update property
    const updateData: { name?: string; city?: string } = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.city !== undefined) updateData.city = body.city

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      property: {
        id: updated.id,
        name: updated.name,
        city: updated.city
      }
    })
  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la propiedad' },
      { status: 500 }
    )
  }
}
