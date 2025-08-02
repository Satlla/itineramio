import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Raw SQL Test - Testing direct SQL queries...')
    
    // Test direct SQL query for property_analytics
    const result = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM property_analytics
    `
    console.log('✅ Property analytics count (raw SQL):', result)
    
    // Test direct SQL query with zoneViews column
    const zoneViewsTest = await prisma.$queryRaw`
      SELECT "zoneViews" FROM property_analytics LIMIT 1
    `
    console.log('✅ Zone views test (raw SQL):', zoneViewsTest)
    
    // Test table schema
    const schemaTest = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'property_analytics' 
      ORDER BY column_name
    `
    console.log('✅ Schema test (raw SQL):', schemaTest)
    
    return NextResponse.json({
      success: true,
      debug: {
        analyticsCount: result,
        zoneViewsTest,
        schema: schemaTest,
        message: 'Raw SQL test successful'
      }
    })
    
  } catch (error) {
    console.error('💥 Raw SQL test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}