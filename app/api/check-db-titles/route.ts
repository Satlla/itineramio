import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get 3 random steps to check title status
    const steps = await prisma.step.findMany({
      take: 3,
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        id: true,
        type: true,
        title: true,
        zoneId: true,
        updatedAt: true
      }
    })
    
    const analysis = steps.map(step => {
      const title = step.title as any
      
      return {
        id: step.id,
        type: step.type,
        updatedAt: step.updatedAt,
        hasTitle: !!title,
        titleEs: title?.es || 'EMPTY',
        titleEn: title?.en || 'EMPTY', 
        titleFr: title?.fr || 'EMPTY',
        titleIsEmptyObject: JSON.stringify(title) === '{"es":"","en":"","fr":""}'
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Database title check',
      stepsChecked: steps.length,
      analysis: analysis
    })
  } catch (error) {
    console.error('Check DB error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}