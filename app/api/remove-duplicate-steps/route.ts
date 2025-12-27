import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const zoneId = 'cmdcrh6a80001l804lrybc2lp'
    
    // Get all steps for this zone
    const steps = await prisma.step.findMany({
      where: {
        zoneId: zoneId
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' } // Keep the oldest one
      ]
    })
    
    console.log(`🔧 Found ${steps.length} steps total`)
    
    // Group by order to find duplicates
    const stepsByOrder = steps.reduce((acc, step) => {
      if (!acc[step.order]) {
        acc[step.order] = []
      }
      acc[step.order].push(step)
      return acc
    }, {} as Record<number, any[]>)
    
    let deletedCount = 0
    
    // For each order, keep only the first (oldest) step and delete the rest
    for (const [order, orderSteps] of Object.entries(stepsByOrder)) {
      if (orderSteps.length > 1) {
        console.log(`🔧 Order ${order} has ${orderSteps.length} duplicates`)
        
        // Keep the first (oldest) step, delete the rest
        const stepsToDelete = orderSteps.slice(1)
        
        for (const stepToDelete of stepsToDelete) {
          console.log(`🗑️ Deleting duplicate step ${stepToDelete.id} (order ${order})`)
          
          await prisma.step.delete({
            where: { id: stepToDelete.id }
          })
          
          deletedCount++
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Removed ${deletedCount} duplicate steps`,
      deletedCount,
      remainingSteps: steps.length - deletedCount
    })
  } catch (error) {
    console.error('Error removing duplicate steps:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}