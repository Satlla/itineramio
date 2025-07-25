import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Force update these specific steps with raw SQL
    const results = await prisma.$executeRaw`
      UPDATE "Step" 
      SET title = '{"es": "", "en": "", "fr": ""}'::jsonb 
      WHERE id IN ('cmdhz7hlm0007l904yxrc05h7', 'cmdhz7i180009l904v9kuo1qf', 'cmdhz7igr000bl904pafgimwe')
    `
    
    console.log(`🔧 Force updated ${results} steps with raw SQL`)
    
    return NextResponse.json({
      success: true,
      message: `Force updated ${results} steps`,
      updatedCount: results
    })
  } catch (error) {
    console.error('Error force updating steps:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}