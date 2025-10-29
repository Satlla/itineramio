import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../src/lib/prisma'

const JWT_SECRET = 'itineramio-secret-key-2024'

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
    
    // Get all property sets for this user
    const propertySets = await prisma.propertySet.findMany({
      where: { hostId: userId },
      include: { properties: true }
    })
    
    // Get all properties for this user
    const allProperties = await prisma.property.findMany({
      where: { hostId: userId },
      select: {
        id: true,
        name: true,
        propertySetId: true
      }
    })
    
    // Fix orphaned properties (properties that reference non-existent property sets)
    const validPropertySetIds = propertySets.map(ps => ps.id)
    const orphanedProperties = allProperties.filter(p => 
      p.propertySetId && !validPropertySetIds.includes(p.propertySetId)
    )
    
    if (orphanedProperties.length > 0) {
      await prisma.property.updateMany({
        where: {
          id: { in: orphanedProperties.map(p => p.id) },
          hostId: userId
        },
        data: {
          propertySetId: null
        }
      })
    }
    
    // Get the specific property set if provided
    const body = await request.json()
    if (body.propertySetId && body.propertyIds) {
      // First, remove all properties from this set
      await prisma.property.updateMany({
        where: {
          propertySetId: body.propertySetId,
          hostId: userId
        },
        data: {
          propertySetId: null
        }
      })
      
      // Then, add the specified properties
      await prisma.property.updateMany({
        where: {
          id: { in: body.propertyIds },
          hostId: userId
        },
        data: {
          propertySetId: body.propertySetId
        }
      })
    }
    
    // Get updated data
    const updatedPropertySets = await prisma.propertySet.findMany({
      where: { hostId: userId },
      include: {
        properties: {
          include: {
            analytics: true,
            zones: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Property sets fixed successfully',
      data: {
        orphanedPropertiesFixed: orphanedProperties.length,
        propertySets: updatedPropertySets.map(ps => ({
          id: ps.id,
          name: ps.name,
          propertyCount: ps.properties.length,
          properties: ps.properties.map(p => ({
            id: p.id,
            name: p.name
          }))
        }))
      }
    })
    
  } catch (error) {
    console.error('Error fixing property sets:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}