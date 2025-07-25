import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const zoneId = 'cmdcrh6a80001l804lrybc2lp' // Check-in zone
    
    console.log(`🔧 Fixing specific zone: ${zoneId}`)
    
    // Get all steps for this zone
    const steps = await prisma.step.findMany({
      where: {
        zoneId: zoneId
      },
      orderBy: {
        order: 'asc'
      }
    })
    
    console.log(`🔧 Found ${steps.length} steps to fix`)
    
    let fixedCount = 0
    
    for (const step of steps) {
      try {
        const title = step.title as any
        const content = step.content as any
        
        // Check if title and content are identical
        const titleEs = title?.es || ''
        const contentEs = content?.es || ''
        
        if (titleEs === contentEs && titleEs.length > 0) {
          console.log(`🔧 Fixing step ${step.id} - clearing duplicate title`)
          console.log(`📝 Original title: "${titleEs.substring(0, 50)}..."`)
          
          // Clear the title since it's the same as content
          await prisma.step.update({
            where: { id: step.id },
            data: {
              title: { es: '', en: '', fr: '' }
            }
          })
          
          fixedCount++
        }
      } catch (error) {
        console.error(`Error processing step ${step.id}:`, error)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Fixed ${fixedCount} steps with duplicate title/content in zone ${zoneId}`,
      stepsFixed: fixedCount,
      zoneId: zoneId
    })
  } catch (error) {
    console.error('Error fixing specific zone:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}