import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

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

    // También actualizar todas las zonas
    await prisma.zone.updateMany({
      where: {
        propertyId: existingProperty.id
      },
      data: {
        isPublished: newIsPublished
      }
    })
    
    // Obtener todos los IDs de zonas para actualizar sus steps
    const zones = await prisma.zone.findMany({
      where: { propertyId: existingProperty.id },
      select: { id: true }
    })
    
    const zoneIds = zones.map(z => z.id)
    
    // Actualizar todos los steps
    if (zoneIds.length > 0) {
      await prisma.step.updateMany({
        where: {
          zoneId: { in: zoneIds }
        },
        data: {
          isPublished: newIsPublished
        }
      })
    }

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