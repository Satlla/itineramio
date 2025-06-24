import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../src/lib/prisma'

const JWT_SECRET = 'itineramio-secret-key-2024'

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const userId = decoded.userId
    
    // Set JWT claims for PostgreSQL RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`
    
    const propertySets = await prisma.propertySet.findMany({
      where: {
        hostId: userId
      },
      include: {
        properties: {
          include: {
            analytics: true,
            zones: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Transform data to include counts and analytics
    const transformedPropertySets = propertySets.map(propertySet => ({
      ...propertySet,
      propertiesCount: propertySet.properties.length,
      totalViews: propertySet.properties.reduce((sum, p) => sum + (p.analytics?.totalViews || 0), 0),
      avgRating: propertySet.properties.length > 0 
        ? propertySet.properties.reduce((sum, p) => sum + (p.analytics?.overallRating || 0), 0) / propertySet.properties.length 
        : 0,
      totalZones: propertySet.properties.reduce((sum, p) => sum + (p.zones?.length || 0), 0)
    }))
    
    return NextResponse.json({
      success: true,
      data: transformedPropertySets
    })
    
  } catch (error) {
    console.error('Error fetching property sets:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const userId = decoded.userId

    // Set JWT claims for PostgreSQL RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`

    const body = await request.json()
    
    // Create the property set
    const propertySet = await prisma.propertySet.create({
      data: {
        // Basic info
        name: body.name,
        description: body.description,
        type: body.type,
        
        // Address
        street: body.street,
        city: body.city,
        state: body.state,
        country: body.country,
        postalCode: body.postalCode,
        
        // Images
        profileImage: body.profileImage,
        
        // Host contact
        hostContactName: body.hostContactName,
        hostContactPhone: body.hostContactPhone,
        hostContactEmail: body.hostContactEmail,
        hostContactLanguage: body.hostContactLanguage,
        hostContactPhoto: body.hostContactPhoto,
        
        // Owner
        hostId: userId,
        
        // Status
        status: 'DRAFT'
      }
    })
    
    // If properties are selected, update them to belong to this set
    if (body.selectedProperties && body.selectedProperties.length > 0) {
      await prisma.property.updateMany({
        where: {
          id: { in: body.selectedProperties },
          hostId: userId // Security: only update user's own properties
        },
        data: {
          propertySetId: propertySet.id
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      data: propertySet
    })
    
  } catch (error) {
    console.error('Error creating property set:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}