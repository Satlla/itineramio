import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Full Migration - Ensuring all PropertyAnalytics columns exist...')
    
    // Add all potentially missing columns for PropertyAnalytics
    const queries = [
      'ALTER TABLE property_analytics ADD COLUMN IF NOT EXISTS "zoneViews" INTEGER DEFAULT 0',
      'ALTER TABLE property_analytics ADD COLUMN IF NOT EXISTS "lastViewedAt" TIMESTAMP',
      'ALTER TABLE property_analytics ADD COLUMN IF NOT EXISTS "lastCalculatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'ALTER TABLE property_analytics ADD COLUMN IF NOT EXISTS "commentsCount" INTEGER DEFAULT 0',
      'ALTER TABLE property_analytics ADD COLUMN IF NOT EXISTS "errorReportsCount" INTEGER DEFAULT 0',
      'ALTER TABLE property_analytics ADD COLUMN IF NOT EXISTS "whatsappClicks" INTEGER DEFAULT 0',
      'ALTER TABLE property_analytics ADD COLUMN IF NOT EXISTS "improvementScore" INTEGER DEFAULT 0',
      'ALTER TABLE property_analytics ADD COLUMN IF NOT EXISTS "totalRatings" INTEGER DEFAULT 0',
      'ALTER TABLE property_analytics ADD COLUMN IF NOT EXISTS "overallRating" DOUBLE PRECISION DEFAULT 0',
      'ALTER TABLE property_analytics ADD COLUMN IF NOT EXISTS "avgSessionDuration" INTEGER DEFAULT 0',
      'ALTER TABLE property_analytics ADD COLUMN IF NOT EXISTS "uniqueVisitors" INTEGER DEFAULT 0',
      'ALTER TABLE property_analytics ADD COLUMN IF NOT EXISTS "totalViews" INTEGER DEFAULT 0'
    ]
    
    for (const query of queries) {
      try {
        await prisma.$executeRawUnsafe(query)
        console.log(`✅ Executed: ${query.slice(0, 60)}...`)
      } catch (error) {
        console.warn(`⚠️ Query might have failed: ${error}`)
      }
    }
    
    console.log('✅ Full migration completed')
    
    // Verify current schema
    const schemaCheck = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'property_analytics' 
      ORDER BY column_name
    `
    
    return NextResponse.json({
      success: true,
      message: 'Full PropertyAnalytics schema migration completed',
      schema: schemaCheck
    })
    
  } catch (error) {
    console.error('💥 Full migration error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}