import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

// GET /api/test-steps-direct - Test steps directly without auth
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const zoneId = url.searchParams.get('zoneId')
    
    if (!zoneId) {
      return NextResponse.json({ error: 'zoneId parameter required' }, { status: 400 })
    }

    // Direct query without auth or RLS
    const steps = await prisma.$queryRaw`
      SELECT 
        id, 
        "zoneId", 
        type, 
        title, 
        content,
        "order",
        "isPublished", 
        "createdAt", 
        "updatedAt"
      FROM steps
      WHERE "zoneId" = ${zoneId}
      ORDER BY COALESCE("order", 0) ASC, id ASC
    ` as any[]

    return NextResponse.json({
      success: true,
      zoneId,
      count: steps.length,
      data: steps
    })

  } catch (error) {
    console.error('Error in direct steps test:', error)
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}