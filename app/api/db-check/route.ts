import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DB Check - Testing database connection and Prisma client...')
    
    // Test basic connection
    const userCount = await prisma.user.count()
    console.log('✅ User count:', userCount)
    
    const propertyCount = await prisma.property.count()
    console.log('✅ Property count:', propertyCount)
    
    // Test property analytics table structure
    const analyticsCount = await prisma.propertyAnalytics.count()
    console.log('✅ PropertyAnalytics count:', analyticsCount)
    
    // Try to get first property with analytics
    const sampleProperty = await prisma.property.findFirst({
      include: {
        analytics: true
      }
    })
    
    return NextResponse.json({
      success: true,
      debug: {
        userCount,
        propertyCount,
        analyticsCount,
        hasAnalytics: !!sampleProperty?.analytics,
        analyticsFields: sampleProperty?.analytics ? Object.keys(sampleProperty.analytics) : [],
        message: 'Database connection successful'
      }
    })
    
  } catch (error) {
    console.error('💥 DB Check error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}