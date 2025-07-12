import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

// TEMPORARY DEBUG ENDPOINT - REMOVE IN PRODUCTION
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== 'Bearer admin-debug-token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Temporarily disable RLS on zones table
    await prisma.$executeRaw`ALTER TABLE public.zones DISABLE ROW LEVEL SECURITY`
    
    return NextResponse.json({
      success: true,
      message: 'RLS disabled on zones table temporarily'
    })
    
  } catch (error) {
    console.error('Error disabling RLS:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check if user is admin
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== 'Bearer admin-debug-token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Re-enable RLS on zones table
    await prisma.$executeRaw`ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY`
    
    return NextResponse.json({
      success: true,
      message: 'RLS re-enabled on zones table'
    })
    
  } catch (error) {
    console.error('Error enabling RLS:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}