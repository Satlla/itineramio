import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const propertyId = (await params).id

    // Verificar que la propiedad existe (handle potential ID truncation)
    let existingProperty = await prisma.property.findFirst({
      where: { id: propertyId }
    })

    // If not found with exact match, try startsWith (for Next.js truncation)
    if (!existingProperty) {
      const properties = await prisma.property.findMany({
        where: {
          id: {
            startsWith: propertyId
          }
        }
      })
      existingProperty = properties[0]
    }

    if (!existingProperty) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada'
      }, { status: 404 })
    }

    // Alternar el estado y la publicación
    const newStatus = existingProperty.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE'
    const newIsPublished = newStatus === 'ACTIVE'

    // Actualizar la propiedad
    const updatedProperty = await prisma.property.update({
      where: { id: existingProperty.id },
      data: { 
        status: newStatus,
        isPublished: newIsPublished,
        publishedAt: newIsPublished ? new Date() : null
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedProperty,
      message: `Propiedad ${newStatus === 'ACTIVE' ? 'activada' : 'desactivada'} correctamente`
    })

  } catch (error) {
    console.error('Error toggling property status:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}