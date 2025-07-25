import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Delete specific duplicate step IDs, keeping only the first one of each order
    const duplicateIds = [
      'cmdi0eijh0003jh04vft1idyu', // duplicate order 1
      'cmdi0eiz90007jh040bg0rbs3', // duplicate order 2  
      'cmdi0ejev000bjh04brvxvmru'  // duplicate order 3
    ]
    
    console.log(`🗑️ Force deleting ${duplicateIds.length} duplicate steps`)
    
    let deletedCount = 0
    
    for (const stepId of duplicateIds) {
      try {
        await prisma.step.delete({
          where: { id: stepId }
        })
        console.log(`🗑️ Deleted step ${stepId}`)
        deletedCount++
      } catch (error) {
        console.error(`Error deleting step ${stepId}:`, error)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Force deleted ${deletedCount} duplicate steps`,
      deletedIds: duplicateIds,
      deletedCount
    })
  } catch (error) {
    console.error('Error force deleting duplicates:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}