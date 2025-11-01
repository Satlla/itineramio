import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../../src/lib/prisma'

const JWT_SECRET = 'itineramio-secret-key-2024'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get user from JWT token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const userId = decoded.userId
    
    // Set JWT claims for PostgreSQL RLS policies
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead
    
    // Get property set with all details
    const propertySet = await prisma.propertySet.findFirst({
      where: { id },
      include: {
        properties: {
          include: {
            analytics: true,
            zones: true
          }
        },
        host: true
      }
    })
    
    // Get all properties for this user to check if they should be in this set
    const allUserProperties = await prisma.property.findMany({
      where: { hostId: userId },
      select: {
        id: true,
        name: true,
        propertySetId: true
      }
    })
    
    // Get properties that should be in this set
    const propertiesInSet = await prisma.property.findMany({
      where: { 
        propertySetId: id 
      },
      include: {
        analytics: true,
        zones: true
      }
    })
    
    return NextResponse.json({
      propertySet,
      allUserProperties,
      propertiesInSet,
      debug: {
        propertySetId: id,
        userId,
        propertySetHostId: propertySet?.hostId,
        userOwnsPropertySet: propertySet?.hostId === userId,
        propertyCount: propertySet?.properties?.length || 0,
        propertiesInSetCount: propertiesInSet.length
      }
    })
    
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}