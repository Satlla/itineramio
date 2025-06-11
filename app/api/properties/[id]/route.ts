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
    
    const property = await prisma.property.findUnique({
      where: {
        id
      },
      include: {
        analytics: true
      }
    })
    
    // Fetch zones separately using the same logic that works in zones API
    let zones: any[] = []
    try {
      const allZones = await prisma.zone.findMany()
      zones = allZones.filter(zone => zone.propertyId === id)
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
    
    const updatedProperty = await prisma.property.update({
      where: { id },
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