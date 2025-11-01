import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../../src/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = 'itineramio-secret-key-2024'

// GET /api/properties/[id]/zones/[zoneId]/steps/[stepId] - Get specific step
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string; stepId: string }> }
) {
  try {
    const { id: propertyId, zoneId, stepId } = await params

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

    // Set JWT claims for RLS policies
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead

    // Verify user owns the property
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        hostId: userId
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada o no autorizada' },
        { status: 404 }
      )
    }

    // Verify the step belongs to the zone and property
    const step = await prisma.step.findFirst({
      where: {
        id: stepId,
        zoneId: zoneId,
        zones: {
          propertyId: propertyId
        }
      },
      include: {
        zones: {
          select: {
            name: true,
            property: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!step) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Paso no encontrado' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: step
    })
  } catch (error) {
    console.error('Error fetching step:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener el paso' 
      },
      { status: 500 }
    )
  }
}

// PUT /api/properties/[id]/zones/[zoneId]/steps/[stepId] - Update step
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string; stepId: string }> }
) {
  try {
    const { id: propertyId, zoneId, stepId } = await params
    const body = await request.json()

    // Check if step exists and belongs to the zone and property
    const existingStep = await prisma.step.findFirst({
      where: {
        id: stepId,
        zoneId: zoneId,
        zones: {
          propertyId: propertyId
        }
      }
    })

    if (!existingStep) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Paso no encontrado' 
        },
        { status: 404 }
      )
    }

    // Validate type-specific requirements if type is being changed
    const { type, mediaUrl, linkUrl } = body
    
    if (type) {
      if (type === 'IMAGE' && !mediaUrl) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'La URL de la imagen es requerida para pasos de imagen' 
          },
          { status: 400 }
        )
      }

      if (type === 'VIDEO' && !mediaUrl) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'La URL del video es requerida para pasos de video' 
          },
          { status: 400 }
        )
      }

      if (type === 'LINK' && !linkUrl) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'La URL del enlace es requerida para pasos de enlace' 
          },
          { status: 400 }
        )
      }
    }

    // Update the step
    const step = await prisma.step.update({
      where: { id: stepId },
      data: {
        ...body,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: step
    })

  } catch (error) {
    console.error('Error updating step:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar el paso' 
      },
      { status: 500 }
    )
  }
}

// DELETE /api/properties/[id]/zones/[zoneId]/steps/[stepId] - Delete step
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string; stepId: string }> }
) {
  try {
    const { id: propertyId, zoneId, stepId } = await params

    // Check if step exists and belongs to the zone and property
    const existingStep = await prisma.step.findFirst({
      where: {
        id: stepId,
        zoneId: zoneId,
        zones: {
          propertyId: propertyId
        }
      }
    })

    if (!existingStep) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Paso no encontrado' 
        },
        { status: 404 }
      )
    }

    // Delete the step
    await prisma.step.delete({
      where: { id: stepId }
    })

    return NextResponse.json({
      success: true,
      message: 'Paso eliminado correctamente'
    })

  } catch (error) {
    console.error('Error deleting step:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al eliminar el paso' 
      },
      { status: 500 }
    )
  }
}