import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function GET() {
  try {
    const testPropertyId = 'cmdcrgua10001jv04cbhb1pyn'
    const testZoneId = 'cmdcrh6a80001l804lrybc2lp'
    
    console.log('🔍 Testing public endpoints with debug info')
    
    // Test 1: Check if property exists
    let propertyCheck = null
    let propertyError = null
    
    try {
      propertyCheck = await prisma.$queryRaw`
        SELECT id, name, "isPublished", status
        FROM properties
        WHERE id = ${testPropertyId}
        LIMIT 1
      ` as any[]
    } catch (e) {
      propertyError = e instanceof Error ? e.message : 'Unknown error'
    }
    
    // Test 2: Check zones for property
    let zonesCheck = null
    let zonesError = null
    
    if (propertyCheck && propertyCheck.length > 0) {
      try {
        zonesCheck = await prisma.$queryRaw`
          SELECT id, name, "propertyId", "isPublished", status
          FROM zones
          WHERE "propertyId" = ${testPropertyId}
          LIMIT 5
        ` as any[]
      } catch (e) {
        zonesError = e instanceof Error ? e.message : 'Unknown error'
      }
    }
    
    // Test 3: Check steps for zone
    let stepsCheck = null
    let stepsError = null
    
    try {
      stepsCheck = await prisma.$queryRaw`
        SELECT id, "zoneId", type, "isPublished"
        FROM steps
        WHERE "zoneId" = ${testZoneId}
        LIMIT 5
      ` as any[]
    } catch (e) {
      stepsError = e instanceof Error ? e.message : 'Unknown error'
    }
    
    // Test 4: Try the actual by-slug logic
    let bySlugTest = null
    let bySlugError = null
    
    try {
      const properties = await prisma.$queryRaw`
        SELECT 
          id, name, slug, description, type,
          street, city, state, country, "postalCode",
          bedrooms, bathrooms, "maxGuests", "squareMeters",
          "profileImage", "hostContactName", "hostContactPhone",
          "hostContactEmail", "hostContactLanguage", "hostContactPhoto",
          status, "isPublished", "propertySetId", "hostId",
          "createdAt", "updatedAt", "publishedAt"
        FROM properties
        WHERE id = ${testPropertyId}
          AND "isPublished" = true
        LIMIT 1
      ` as any[]
      
      bySlugTest = properties[0] || null
    } catch (e) {
      bySlugError = e instanceof Error ? e.message : 'Unknown error'
    }
    
    return NextResponse.json({
      success: true,
      data: {
        testPropertyId,
        testZoneId,
        
        propertyCheck: {
          found: propertyCheck?.length || 0,
          data: propertyCheck?.[0] || null,
          error: propertyError
        },
        
        zonesCheck: {
          found: zonesCheck?.length || 0,
          data: zonesCheck || [],
          error: zonesError
        },
        
        stepsCheck: {
          found: stepsCheck?.length || 0,
          data: stepsCheck || [],
          error: stepsError
        },
        
        bySlugTest: {
          found: !!bySlugTest,
          data: bySlugTest,
          error: bySlugError
        },
        
        // Database connection test
        connectionTest: 'OK - queries executed successfully'
      }
    })
    
  } catch (error) {
    console.error('Debug endpoint error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
}