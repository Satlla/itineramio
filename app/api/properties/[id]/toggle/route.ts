import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const propertyId = (await params).id
    
    console.log('🔄 Toggle property request:', propertyId)

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

    // Si se está activando la propiedad, también publicar todas las zonas y pasos
    if (newIsPublished) {
      // Actualizar todas las zonas de esta propiedad
      await prisma.zone.updateMany({
        where: { propertyId: existingProperty.id },
        data: {
          status: 'ACTIVE',
          isPublished: true
        }
      })

      // Obtener todas las zonas para actualizar sus pasos
      const zones = await prisma.zone.findMany({
        where: { propertyId: existingProperty.id },
        select: { id: true }
      })

      // Actualizar todos los pasos de las zonas
      if (zones.length > 0) {
        await prisma.step.updateMany({
          where: {
            zoneId: {
              in: zones.map(z => z.id)
            }
          },
          data: {
            isPublished: true
          }
        })
      }

      console.log(`✅ Published ${zones.length} zones and their steps for property ${existingProperty.id}`)
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