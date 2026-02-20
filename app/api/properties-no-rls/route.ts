import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { requireAuth } from '../../../src/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // DON'T set RLS config - this might be causing the issue
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Simple query without RLS
    const properties = await prisma.property.findMany({
      where: {
        hostId: userId,
        deletedAt: null
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        type: true,
        city: true,
        state: true,
        bedrooms: true,
        bathrooms: true,
        maxGuests: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        isPublished: true
      }
    })
    
    const total = await prisma.property.count({ 
      where: { hostId: userId } 
    })

    // Transform data
    const propertiesWithZones = properties.map((property) => ({
      ...property,
      zonesCount: 0, // Simplified for now
      totalViews: 0,
      avgRating: 0,
      propertySet: null
    }))

    return NextResponse.json({
      success: true,
      data: propertiesWithZones,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching properties (no RLS):', error)

    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}