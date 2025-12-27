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
    
    const problematicPropertyId = 'cmdsr3qi70001lj04y8jvt893'
    
    console.log('🔍 Debugging specific property:', problematicPropertyId)
    
    // Test 1: Check if property exists at all
    let propertyExists = null
    let propertyError = null
    
    try {
      propertyExists = await prisma.property.findFirst({
        where: { id: problematicPropertyId },
        select: {
          id: true,
          name: true,
          hostId: true,
          status: true,
          isPublished: true,
          propertySetId: true
        }
      })
    } catch (e) {
      propertyError = e instanceof Error ? e.message : 'Unknown error'
    }
    
    // Test 2: Try with user filter
    let propertyForUser = null
    let userError = null
    
    if (propertyExists) {
      try {
        propertyForUser = await prisma.property.findFirst({
          where: {
            id: problematicPropertyId,
            hostId: userId
          },
          select: {
            id: true,
            name: true,
            hostId: true,
            status: true,
            isPublished: true,
            propertySetId: true
          }
        })
      } catch (e) {
        userError = e instanceof Error ? e.message : 'Unknown error'
      }
    }
    
    // Test 3: Try to get zones
    let zones = null
    let zonesError = null
    
    if (propertyExists) {
      try {
        zones = await prisma.zone.findMany({
          where: {
            propertyId: problematicPropertyId
          },
          select: {
            id: true,
            name: true,
            isPublished: true
          },
          take: 5 // Limit to avoid too much data
        })
      } catch (e) {
        zonesError = e instanceof Error ? e.message : 'Unknown error'
      }
    }
    
    // Test 4: Try the safe property endpoint logic
    let safeProperty = null
    let safeError = null
    
    try {
      const safeProperties = await prisma.$queryRaw`
        SELECT 
          id, name, slug, description, type,
          street, city, state, country, "postalCode",
          bedrooms, bathrooms, "maxGuests", "squareMeters",
          "profileImage", "hostContactName", "hostContactPhone",
          "hostContactEmail", "hostContactLanguage", "hostContactPhoto",
          status, "isPublished", "propertySetId", "hostId",
          "createdAt", "updatedAt", "publishedAt"
        FROM properties
        WHERE id = ${problematicPropertyId}
          AND "hostId" = ${userId}
        LIMIT 1
      ` as any[]
      
      safeProperty = safeProperties[0] || null
    } catch (e) {
      safeError = e instanceof Error ? e.message : 'Unknown error'
    }
    
    // Test 5: Check what endpoint is actually being called
    const endpointUrl = `/api/properties/${problematicPropertyId}`
    
    return NextResponse.json({
      success: true,
      data: {
        searchedId: problematicPropertyId,
        currentUserId: userId,
        endpointUrl,
        
        // Test results
        propertyExists: !!propertyExists,
        propertyExistsData: propertyExists,
        propertyError,
        
        propertyForUser: !!propertyForUser,
        propertyForUserData: propertyForUser,
        userError,
        
        zones: zones?.length || 0,
        zonesError,
        
        safeProperty: !!safeProperty,
        safePropertyData: safeProperty,
        safeError,
        
        // Analysis
        analysis: {
          existsInDB: !!propertyExists,
          belongsToUser: !!propertyForUser,
          ownershipMatch: propertyExists ? propertyExists.hostId === userId : false,
          actualOwner: propertyExists?.hostId,
          hasZones: (zones?.length || 0) > 0,
          canUseSafeEndpoint: !!safeProperty,
          
          probableIssue: !propertyExists 
            ? 'Property does not exist'
            : !propertyForUser
            ? 'Property exists but does not belong to current user'
            : zonesError
            ? 'Zones query failed'
            : safeError
            ? 'Raw SQL query failed'
            : 'Unknown issue'
        }
      }
    })
    
  } catch (error) {
    console.error('Error in specific property debug:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}