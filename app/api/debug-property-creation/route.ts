import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get the most recent properties to check their publication status
    const recentProperties = await prisma.property.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        name: true,
        status: true,
        isPublished: true,
        createdAt: true,
        hostId: true
      }
    })
    
    console.log('🔍 Recent properties debug:', recentProperties)
    
    return NextResponse.json({
      success: true,
      recentProperties: recentProperties.map(p => ({
        id: p.id.substring(0, 8) + '...',
        name: p.name,
        status: p.status,
        isPublished: p.isPublished,
        createdAt: p.createdAt,
        hostId: p.hostId.substring(0, 8) + '...'
      }))
    })
    
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}