import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const propertyId = (await params).id

    // Verificar que la propiedad existe
    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId }
    })

    if (!existingProperty) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada'
      }, { status: 404 })
    }

    // Alternar el estado
    const newStatus = existingProperty.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE'

    // Actualizar la propiedad
    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: { status: newStatus }
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