import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { requireAuth } from '../../../src/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🚨 Emergency Auth Fix - Starting...')
    
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      console.log('❌ Auth failed in emergency fix')
      return NextResponse.json({
        success: false,
        error: 'Auth failed',
        step: 'auth'
      })
    }
    const userId = authResult.userId
    console.log('✅ Auth success in emergency fix, userId:', userId)
    
    // Try to get properties without RLS constraints
    console.log('🔄 Trying to get properties without RLS...')
    
    // Disable RLS temporarily for this session
    await prisma.$executeRaw`SET row_security = off`
    
    // Try simple properties query
    const properties = await prisma.property.findMany({
      where: { hostId: userId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        isPublished: true,
        status: true
      },
      take: 5
    })
    
    console.log('✅ Properties found:', properties.length)
    
    // Re-enable RLS
    await prisma.$executeRaw`SET row_security = on`
    
    // Also try property sets
    const propertySets = await prisma.propertySet.findMany({
      where: { hostId: userId },
      select: {
        id: true,
        name: true,
        createdAt: true
      },
      take: 5
    })
    
    console.log('✅ Property sets found:', propertySets.length)
    
    return NextResponse.json({
      success: true,
      debug: {
        userId,
        propertiesCount: properties.length,
        propertySetsCount: propertySets.length,
        properties: properties.slice(0, 3),
        propertySets: propertySets.slice(0, 3),
        message: 'Emergency auth fix successful - RLS may have been the issue'
      }
    })
    
  } catch (error) {
    console.error('💥 Emergency fix error:', error)
    
    // Try to re-enable RLS if it was disabled
    try {
      await prisma.$executeRaw`SET row_security = on`
    } catch (rlsError) {
      console.error('Failed to re-enable RLS:', rlsError)
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}