import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // TODO: Get user ID from authentication session  
    // For now, find the demo user
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@itineramio.com' }
    })
    
    if (!demoUser) {
      return NextResponse.json({
        success: false,
        error: 'Usuario demo no encontrado'
      }, { status: 404 })
    }
    
    const userId = demoUser.id
    
    const propertySet = await prisma.propertySet.findUnique({
      where: {
        id
      },
      include: {
        properties: {
          include: {
            analytics: true,
            zones: true
          }
        }
      }
    })
    
    if (!propertySet) {
      return NextResponse.json({
        success: false,
        error: 'Conjunto de propiedades no encontrado'
      }, { status: 404 })
    }
    
    // Transform data to include counts and analytics
    const transformedPropertySet = {
      ...propertySet,
      propertiesCount: propertySet.properties.length,
      totalViews: propertySet.properties.reduce((sum, p) => sum + (p.analytics?.totalViews || 0), 0),
      avgRating: propertySet.properties.length > 0 
        ? propertySet.properties.reduce((sum, p) => sum + (p.analytics?.overallRating || 0), 0) / propertySet.properties.length 
        : 0
    }
    
    return NextResponse.json({
      success: true,
      data: transformedPropertySet
    })
    
  } catch (error) {
    console.error('Error fetching property set:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // TODO: Get user ID from authentication session  
    // For now, find the demo user
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@itineramio.com' }
    })
    
    if (!demoUser) {
      return NextResponse.json({
        success: false,
        error: 'Usuario demo no encontrado'
      }, { status: 404 })
    }
    
    const userId = demoUser.id
    
    const propertySet = await prisma.propertySet.findFirst({
      where: {
        id,
        hostId: userId // Using hostId to match the correct user
      }
    })
    
    if (!propertySet) {
      return NextResponse.json({
        success: false,
        error: 'Conjunto de propiedades no encontrado'
      }, { status: 404 })
    }
    
    const updatedPropertySet = await prisma.propertySet.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date()
      }
    })
    
    // If properties are selected, update them
    if (body.selectedProperties !== undefined) {
      // First, remove this property set from all properties
      await prisma.property.updateMany({
        where: {
          propertySetId: id,
          hostId: userId
        },
        data: {
          propertySetId: null
        }
      })
      
      // Then, add the selected properties to this set
      if (body.selectedProperties.length > 0) {
        await prisma.property.updateMany({
          where: {
            id: { in: body.selectedProperties },
            hostId: userId // Security: only update user's own properties
          },
          data: {
            propertySetId: id
          }
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      data: updatedPropertySet
    })
    
  } catch (error) {
    console.error('Error updating property set:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // TODO: Get user ID from authentication session  
    // For now, find the demo user
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@itineramio.com' }
    })
    
    if (!demoUser) {
      return NextResponse.json({
        success: false,
        error: 'Usuario demo no encontrado'
      }, { status: 404 })
    }
    
    const userId = demoUser.id
    
    const propertySet = await prisma.propertySet.findFirst({
      where: {
        id,
        hostId: userId // Using hostId to match the correct user
      }
    })
    
    if (!propertySet) {
      return NextResponse.json({
        success: false,
        error: 'Conjunto de propiedades no encontrado'
      }, { status: 404 })
    }
    
    // Remove property set reference from all properties first
    await prisma.property.updateMany({
      where: {
        propertySetId: id
      },
      data: {
        propertySetId: null
      }
    })
    
    // Delete the property set
    await prisma.propertySet.delete({
      where: { id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Conjunto de propiedades eliminado exitosamente'
    })
    
  } catch (error) {
    console.error('Error deleting property set:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}