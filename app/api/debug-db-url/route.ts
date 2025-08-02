import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DB URL Debug - Checking database configuration...')
    
    const dbUrl = process.env.DATABASE_URL
    const dbUrlMasked = dbUrl ? 
      dbUrl.replace(/:[^:@]*@/, ':***@').replace(/\/\/[^:]*:/, '//***:') 
      : 'NOT_SET'
    
    return NextResponse.json({
      success: true,
      debug: {
        hasDatabaseUrl: !!dbUrl,
        databaseUrlMasked: dbUrlMasked,
        databaseUrlLength: dbUrl?.length || 0,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        message: 'Database URL debug info'
      }
    })
    
  } catch (error) {
    console.error('💥 DB URL debug error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}