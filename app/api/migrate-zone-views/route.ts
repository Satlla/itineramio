import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Migration - Adding zoneViews column to property_analytics...')
    
    // Execute raw SQL to add the column if it doesn't exist
    await prisma.$executeRaw`
      ALTER TABLE property_analytics 
      ADD COLUMN IF NOT EXISTS "zoneViews" INTEGER DEFAULT 0
    `
    
    console.log('✅ Migration completed successfully')
    
    // Verify the column was added by checking schema
    const schemaCheck = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'property_analytics' 
      AND column_name = 'zoneViews'
    `
    
    return NextResponse.json({
      success: true,
      message: 'zoneViews column migration completed',
      verification: schemaCheck
    })
    
  } catch (error) {
    console.error('💥 Migration error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}