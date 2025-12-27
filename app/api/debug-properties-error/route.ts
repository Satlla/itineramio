import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { requireAuth } from '../../../src/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Properties Error - Starting diagnosis...')
    
    // Step 1: Test auth
    console.log('📋 Step 1: Testing auth...')
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      console.log('❌ Auth failed')
      return NextResponse.json({
        success: false,
        error: 'Auth failed',
        step: 'auth'
      })
    }
    const userId = authResult.userId
    console.log('✅ Auth success, userId:', userId)
    
    // Step 2: Test database connection
    console.log('📋 Step 2: Testing database connection...')
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection OK:', dbTest)
    
    // Step 3: Test simple user query
    console.log('📋 Step 3: Testing simple user query...')
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    })
    console.log('✅ User query result:', userExists)
    
    // Step 4: Test properties count
    console.log('📋 Step 4: Testing properties count...')
    const propertiesCount = await prisma.property.count({
      where: { hostId: userId }
    })
    console.log('✅ Properties count:', propertiesCount)
    
    // Step 5: Test simple properties query
    console.log('📋 Step 5: Testing simple properties query...')
    const simpleProperties = await prisma.property.findMany({
      where: { hostId: userId },
      select: {
        id: true,
        name: true,
        createdAt: true
      },
      take: 1
    })
    console.log('✅ Simple properties query result:', simpleProperties)
    
    // Step 6: Test with _count
    console.log('📋 Step 6: Testing properties with _count...')
    const propertiesWithCount = await prisma.property.findMany({
      where: { hostId: userId },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            zones: true
          }
        }
      },
      take: 1
    })
    console.log('✅ Properties with count:', propertiesWithCount)
    
    // Step 7: Test with analytics relation
    console.log('📋 Step 7: Testing properties with analytics...')
    const propertiesWithAnalytics = await prisma.property.findMany({
      where: { hostId: userId },
      include: {
        analytics: true
      },
      take: 1
    })
    console.log('✅ Properties with analytics:', propertiesWithAnalytics)
    
    // Step 8: Test with propertySet relation
    console.log('📋 Step 8: Testing properties with propertySet...')
    const propertiesWithSet = await prisma.property.findMany({
      where: { hostId: userId },
      include: {
        propertySet: {
          select: {
            id: true,
            name: true
          }
        }
      },
      take: 1
    })
    console.log('✅ Properties with propertySet:', propertiesWithSet)
    
    return NextResponse.json({
      success: true,
      debug: {
        userId,
        userExists: !!userExists,
        propertiesCount,
        simplePropertiesLength: simpleProperties.length,
        propertiesWithCountLength: propertiesWithCount.length,
        propertiesWithAnalyticsLength: propertiesWithAnalytics.length,
        propertiesWithSetLength: propertiesWithSet.length
      }
    })
    
  } catch (error) {
    console.error('💥 Debug endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}