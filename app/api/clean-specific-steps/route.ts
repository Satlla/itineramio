import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Specific step IDs from your debug data
    const stepIds = [
      'cmdhz7hlm0007l904yxrc05h7',
      'cmdhz7i180009l904v9kuo1qf', 
      'cmdhz7igr000bl904pafgimwe'
    ]
    
    console.log(`🔧 Cleaning ${stepIds.length} specific steps`)
    
    let fixedCount = 0
    
    for (const stepId of stepIds) {
      try {
        // Clear the title for this specific step
        await prisma.step.update({
          where: { id: stepId },
          data: {
            title: { es: '', en: '', fr: '' }
          }
        })
        
        console.log(`🔧 Cleared title for step ${stepId}`)
        fixedCount++
      } catch (error) {
        console.error(`Error processing step ${stepId}:`, error)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Cleared titles for ${fixedCount} specific steps`,
      stepsFixed: fixedCount,
      stepIds: stepIds
    })
  } catch (error) {
    console.error('Error cleaning specific steps:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}