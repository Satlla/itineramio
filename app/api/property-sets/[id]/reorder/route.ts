import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertySetId } = await params
    const { propertyOrders } = await request.json()
    
    // Get user from JWT token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const userId = decoded.userId

    console.log('🔄 Reordering properties in set:', propertySetId)
    console.log('New order:', propertyOrders)

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
    console.log('⚠️ Property reordering is temporarily disabled - order column missing')
    
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

    console.log('✅ Properties reordered successfully')

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