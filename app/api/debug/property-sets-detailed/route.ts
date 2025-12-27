import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../src/lib/prisma'

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
    
    console.log('🔍 Debugging property sets for user:', userId)
    
    // Get all property sets without user filter
    const allPropertySets = await prisma.propertySet.findMany({
      select: {
        id: true,
        name: true,
        hostId: true,
        _count: {
          select: {
            properties: true
          }
        }
      }
    })
    
    // Get property sets for this user
    const userPropertySets = await prisma.propertySet.findMany({
      where: {
        hostId: userId
      },
      select: {
        id: true,
        name: true,
        hostId: true,
        _count: {
          select: {
            properties: true
          }
        }
      }
    })
    
    // Get all properties with their propertySetId
    const allProperties = await prisma.property.findMany({
      select: {
        id: true,
        name: true,
        hostId: true,
        propertySetId: true
      },
      where: {
        propertySetId: {
          not: null
        }
      }
    })
    
    // Get properties for this user
    const userProperties = await prisma.property.findMany({
      select: {
        id: true,
        name: true,
        hostId: true,
        propertySetId: true
      },
      where: {
        hostId: userId,
        propertySetId: {
          not: null
        }
      }
    })
    
    // Check specific failing property
    const failingProperty = await prisma.property.findFirst({
      where: {
        id: 'cmdsr3qi70001lj04y8jvt893'
      },
      select: {
        id: true,
        name: true,
        hostId: true,
        propertySetId: true
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        currentUserId: userId,
        allPropertySets: allPropertySets.length,
        userPropertySets: userPropertySets.length,
        allPropertiesWithSets: allProperties.length,
        userPropertiesWithSets: userProperties.length,
        
        // Detailed data
        propertySetDetails: userPropertySets,
        propertiesInSets: userProperties,
        failingProperty,
        
        // Count mismatches
        propertySetCounts: userPropertySets.map(ps => ({
          id: ps.id,
          name: ps.name,
          expectedCount: ps._count.properties,
          actualUserProperties: userProperties.filter(p => p.propertySetId === ps.id).length
        }))
      }
    })
    
  } catch (error) {
    console.error('Error debugging property sets:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}