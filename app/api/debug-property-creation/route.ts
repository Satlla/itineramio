import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { requireAuth } from '../../../src/lib/auth'

export async function GET() {
  try {
    console.log('🔍 DEBUG PROPERTY CREATION - Testing basic steps')
    
    // Test database connection first
    await prisma.$connect()
    console.log('🔍 DB connection: OK')
    
    // Test simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('🔍 Simple query:', result)
    
    // Test properties table structure
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'properties' 
      ORDER BY ordinal_position
    ` as any[]
    
    console.log('🔍 Properties table structure:', tableInfo)
    
    return NextResponse.json({
      success: true,
      message: 'Debug property creation - basic tests passed',
      dbConnected: true,
      tableColumns: tableInfo
    })
    
  } catch (error) {
    console.error('🔍 DEBUG PROPERTY CREATION - Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 DEBUG PROPERTY CREATION POST - Starting')
    
    // Get authenticated user (but don't fail if not authenticated for debug)
    let userId = 'debug-user'
    try {
      const authResult = await requireAuth(request)
      if (authResult instanceof Response) {
        console.log('🔍 DEBUG - Auth failed, using debug user')
      } else {
        userId = authResult.userId
        console.log('🔍 DEBUG - Auth success, userId:', userId)
      }
    } catch (authError) {
      console.log('🔍 DEBUG - Auth error:', authError)
    }

    const body = await request.json()
    console.log('🔍 DEBUG - Body received:', Object.keys(body))
    
    // Test slug generation
    let testSlug = 'debug-property'
    try {
      const { generateSlug } = await import('../../../src/lib/slug-utils')
      testSlug = generateSlug(body.name || 'Test Property')
      console.log('🔍 DEBUG - Generated slug:', testSlug)
    } catch (slugError) {
      console.log('🔍 DEBUG - Slug generation error:', slugError)
      testSlug = 'debug-property-fallback'
    }
    
    // Test unique slug check
    try {
      const existing = await prisma.$queryRaw`
        SELECT id FROM properties WHERE slug = ${testSlug} LIMIT 1
      ` as any[]
      console.log('🔍 DEBUG - Slug exists check:', existing.length > 0)
    } catch (slugCheckError) {
      console.log('🔍 DEBUG - Slug check error:', slugCheckError)
    }
    
    // Test minimal property creation
    const propertyId = `debug-prop-${Date.now()}`
    try {
      await prisma.$executeRaw`
        INSERT INTO properties (
          id, name, slug, description, type,
          street, city, state, country, "postalCode",
          bedrooms, bathrooms, "maxGuests",
          "hostContactName", "hostContactPhone", "hostContactEmail",
          status, "isPublished", "hostId",
          "createdAt", "updatedAt"
        ) VALUES (
          ${propertyId}, 
          ${body.name || 'Debug Property'}, 
          ${testSlug}, 
          ${body.description || 'Debug description for testing'}, 
          ${body.type || 'APARTMENT'},
          ${body.street || 'Debug Street 123'}, 
          ${body.city || 'Debug City'}, 
          ${body.state || 'Debug State'}, 
          ${body.country || 'España'}, 
          ${body.postalCode || '12345'},
          ${body.bedrooms || 1}, 
          ${body.bathrooms || 1}, 
          ${body.maxGuests || 2},
          ${body.hostContactName || 'Debug Host'}, 
          ${body.hostContactPhone || '+34123456789'}, 
          ${body.hostContactEmail || 'debug@test.com'},
          'DRAFT', 
          false, 
          ${userId},
          NOW(), 
          NOW()
        )
      `
      console.log('🔍 DEBUG - Property created successfully:', propertyId)
      
      // Clean up test property
      await prisma.$executeRaw`DELETE FROM properties WHERE id = ${propertyId}`
      console.log('🔍 DEBUG - Test property cleaned up')
      
    } catch (createError) {
      console.log('🔍 DEBUG - Property creation error:', createError)
      return NextResponse.json({
        success: false,
        error: 'Property creation failed',
        details: createError instanceof Error ? createError.message : String(createError),
        stack: createError instanceof Error ? createError.stack : undefined
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Debug property creation test passed',
      testPropertyId: propertyId,
      testSlug,
      userId
    })
    
  } catch (error) {
    console.error('🔍 DEBUG PROPERTY CREATION POST - General error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}