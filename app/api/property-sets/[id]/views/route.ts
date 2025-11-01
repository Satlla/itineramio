import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../src/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertySetId } = await params
    
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Set JWT claims for PostgreSQL RLS policies
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    // Verify property set belongs to user
    const propertySet = await prisma.propertySet.findFirst({
      where: {
        id: propertySetId,
        hostId: userId
      },
      select: {
        id: true,
        name: true
      }
    })

    if (!propertySet) {
      return NextResponse.json({
        success: false,
        error: 'Conjunto de propiedades no encontrado'
      }, { status: 404 })
    }

    // Return simplified response to avoid complex queries
    return NextResponse.json({
      success: true,
      data: {
        propertySet: {
          id: propertySet.id,
          name: propertySet.name,
          propertiesCount: 0 // Temporarily set to 0
        },
        period: {
          startDate: new Date(),
          endDate: new Date(),
          days
        },
        summary: {
          totalPropertyViews: 0,
          totalZoneViews: 0,
          totalViews: 0,
          totalUniqueVisitors: 0,
          totalTimeSpent: 0,
          avgTimeSpent: 0
        },
        dailyViews: [],
        detailedViews: []
      }
    })

  } catch (error) {
    console.error('Error obteniendo visualizaciones del conjunto:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}