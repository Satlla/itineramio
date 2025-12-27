import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../../src/lib/auth'

// Validation schema for zone order update
const updateOrderSchema = z.object({
  zones: z.array(z.object({
    id: z.string(),
    order: z.number()
  }))
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params

    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()

    // Validate request data
    const validatedData = updateOrderSchema.parse(body)

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

    // Update zone order in database
    const updatePromises = validatedData.zones.map(({ id, order }) => {
      return prisma.zone.update({
        where: {
          id,
          propertyId // Ensure zone belongs to this property
        },
        data: { order }
      })
    })

    const results = await prisma.$transaction(updatePromises)

    return NextResponse.json({
      success: true,
      message: 'Orden de zonas actualizado correctamente',
      updatedCount: results.length
    })

  } catch (error) {
    console.error('❌ [ZONE ORDER UPDATE] Error updating zone order:', error)
    console.error('❌ [ZONE ORDER UPDATE] Error stack:', error instanceof Error ? error.stack : 'No stack trace')

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Datos de entrada inválidos',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}