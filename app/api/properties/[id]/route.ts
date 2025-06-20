import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../src/lib/prisma'

const JWT_SECRET = 'itineramio-secret-key-2024'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🔍 Property endpoint - received ID:', id)
    
    // Get user from JWT token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const userId = decoded.userId
    
    // Handle potential ID truncation
    const properties = await prisma.property.findMany({
      where: {
        id: {
          startsWith: id
        },
        hostId: userId
      },
      include: {
        analytics: true
      }
    })
    
    const property = properties[0]
    const actualPropertyId = property?.id || id
    console.log('🔍 Property found:', !!property, 'actualId:', actualPropertyId)
    console.log('🔍 Property slug:', property?.slug)
    
    // Fetch zones separately using the actual property ID
    let zones: any[] = []
    try {
      zones = await prisma.zone.findMany({
        where: {
          propertyId: actualPropertyId
        }
      })
    } catch (zoneError) {
      console.error('Error fetching zones:', zoneError)
      zones = []
    }
    
    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada'
      }, { status: 404 })
    }
    
    // Transform data to include counts and analytics
    const transformedProperty = {
      ...property,
      zonesCount: zones.length,
      totalViews: property.analytics?.totalViews || 0,
      avgRating: property.analytics?.overallRating || 0,
      zones: zones.map(zone => ({
        ...zone,
        stepsCount: 0 // Will add steps count later
      }))
    }
    
    return NextResponse.json({
      success: true,
      data: transformedProperty
    })
    
  } catch (error) {
    console.error('Error fetching property:', error)
    
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
    
    // TODO: Add validation schema for update
    
    // Handle potential ID truncation for PUT as well
    const properties = await prisma.property.findMany({
      where: {
        id: {
          startsWith: id
        },
        hostId: userId
      }
    })
    
    const property = properties[0]
    const actualPropertyId = property?.id || id
    
    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada'
      }, { status: 404 })
    }
    
    const updatedProperty = await prisma.property.update({
      where: { id: actualPropertyId },
      data: {
        ...body,
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json({
      success: true,
      data: updatedProperty
    })
    
  } catch (error) {
    console.error('Error updating property:', error)
    
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
    
    const property = await prisma.property.findFirst({
      where: {
        id,
        hostId: userId // Using hostId to match the correct user
      }
    })
    
    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada'
      }, { status: 404 })
    }
    
    // Delete property and all related data (zones, steps, etc.)
    // Thanks to the cascade delete in the schema, this will handle cleanup
    await prisma.property.delete({
      where: { id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Propiedad eliminada exitosamente'
    })
    
  } catch (error) {
    console.error('Error deleting property:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}