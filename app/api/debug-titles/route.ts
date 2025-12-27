import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all steps for the Check-in zone
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
        content: true
      }
    })
    
    console.log('🔍 Debug - Found steps:', steps.length)
    
    const analysis = steps.map(step => {
      const title = step.title as any
      const content = step.content as any
      
      return {
        id: step.id,
        type: step.type,
        order: step.order,
        hasTitle: !!title,
        titleEs: title?.es || 'NO TITLE',
        titleEn: title?.en || 'NO TITLE',
        titleFr: title?.fr || 'NO TITLE',
        contentEs: content?.es?.substring(0, 50) + '...',
        titleEqualsContent: title?.es === content?.es
      }
    })
    
    return NextResponse.json({
      success: true,
      stepsCount: steps.length,
      analysis: analysis,
      rawSteps: steps
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}