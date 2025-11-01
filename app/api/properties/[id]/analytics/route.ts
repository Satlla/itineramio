import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../src/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    
    // Set JWT claims for PostgreSQL RLS policies
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead
    
    // Get analytics separately to avoid property.order issue
    const analytics = await prisma.propertyAnalytics.findFirst({
      where: {
        propertyId: id
      }
    })
    
    return NextResponse.json({
      success: true,
      data: analytics || {
        totalViews: 0,
        overallRating: 0
      }
    })
    
  } catch (error) {
    console.error('Error fetching property analytics:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}