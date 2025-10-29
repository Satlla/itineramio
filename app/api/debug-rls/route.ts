import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { requireAuth } from '../../../src/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug RLS - Starting diagnosis...')
    
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    console.log('✅ Auth success, userId:', userId)
    
    // Test RLS configuration
    console.log('📋 Testing RLS configuration...')
    
    // Set the user context
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`
    
    // Check current settings
    const currentUserSetting = await prisma.$queryRaw`SELECT current_setting('app.current_user_id', true) as user_id`
    console.log('Current user setting:', currentUserSetting)
    
    // Test if RLS is enabled on properties table
    const rlsStatus = await prisma.$queryRaw`
      SELECT 
        schemaname, 
        tablename, 
        rowsecurity 
      FROM pg_tables 
      WHERE tablename IN ('properties', 'property_sets', 'users')
    `
    console.log('RLS status on tables:', rlsStatus)
    
    // Test direct query without Prisma ORM to bypass potential ORM issues
    const directPropertiesQuery = await prisma.$queryRaw`
      SELECT id, name, "hostId", "createdAt" 
      FROM properties 
      WHERE "hostId" = ${userId} 
      LIMIT 1
    `
    console.log('Direct properties query result:', directPropertiesQuery)
    
    // Test property sets
    const directPropertySetsQuery = await prisma.$queryRaw`
      SELECT id, name, "hostId", "createdAt" 
      FROM property_sets 
      WHERE "hostId" = ${userId} 
      LIMIT 1
    `
    console.log('Direct property sets query result:', directPropertySetsQuery)
    
    return NextResponse.json({
      success: true,
      debug: {
        userId,
        currentUserSetting,
        rlsStatus,
        directPropertiesCount: Array.isArray(directPropertiesQuery) ? directPropertiesQuery.length : 0,
        directPropertySetsCount: Array.isArray(directPropertySetsQuery) ? directPropertySetsQuery.length : 0
      }
    })
    
  } catch (error) {
    console.error('💥 RLS debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}