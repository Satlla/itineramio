import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { requireAuth } from '../../../src/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    
    // Set JWT claims for RLS policies
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead
    
    // Get the specific Check-in zone steps
    const steps = await prisma.step.findMany({
      where: {
        zoneId: 'cmdcrh6a80001l804lrybc2lp'
      },
      orderBy: {
        order: 'asc'
      },
      select: {
        id: true,
        type: true,
        order: true,
        title: true,
        updatedAt: true
      }
    })
    
    const analysis = steps.map(step => {
      const title = step.title as any
      
      return {
        id: step.id,
        type: step.type,
        order: step.order,
        updatedAt: step.updatedAt,
        hasTitle: !!title,
        titleEs: title?.es || '[EMPTY]',
        titleEn: title?.en || '[EMPTY]',
        titleFr: title?.fr || '[EMPTY]',
        rawTitle: JSON.stringify(title)
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Title verification for Check-in zone',
      stepsCount: steps.length,
      analysis: analysis
    })
  } catch (error) {
    console.error('Verify titles error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}