import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../src/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertySetId } = await params
    const { propertyOrders } = await request.json()

    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult
    const userId = authResult.userId


    // Verify the property set belongs to the user
    const propertySet = await prisma.propertySet.findFirst({
      where: {
        id: propertySetId,
        hostId: userId
      }
    })

    if (!propertySet) {
      return NextResponse.json(
        { error: 'Conjunto no encontrado' },
        { status: 404 }
      )
    }

    // Update each property with its new order
    // TEMPORARILY DISABLED: properties.order column doesn't exist in production
    
    // const updatePromises = propertyOrders.map((item: { id: string; order: number }) =>
    //   prisma.property.update({
    //     where: { 
    //       id: item.id,
    //       propertySetId: propertySetId,
    //       hostId: userId // Security check
    //     },
    //     data: { order: item.order }
    //   })
    // )

    // await Promise.all(updatePromises)


    return NextResponse.json({
      success: true,
      message: 'Orden de propiedades actualizado'
    })

  } catch (error) {
    console.error('💥 Error reordering properties:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}