import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Find all steps where title equals content (legacy data)
    const steps = await prisma.step.findMany({
      where: {
        OR: [
          {
            // For steps where title and content are identical JSON objects
            title: {
              not: { equals: { es: '', en: '', fr: '' } }
            }
          }
        ]
      }
    })

    console.log(`🔧 Found ${steps.length} steps to check`)

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
      message: `Fixed ${fixedCount} legacy steps with duplicate title/content`,
      totalStepsChecked: steps.length,
      stepsFixed: fixedCount
    })
  } catch (error) {
    console.error('Error fixing legacy steps:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}