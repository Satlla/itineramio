import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Import Prisma after try block to catch import errors
    const { prisma } = await import('../../../src/lib/prisma')
    
    // Test basic connection
    await prisma.$connect()
    
    // Test simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    return NextResponse.json({
      success: true,
      message: 'Basic connection test passed',
      result
    })
    
  } catch (error) {
    console.error('Basic test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Basic test failed',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}