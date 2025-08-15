import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '../../../../../../src/lib/admin-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    return NextResponse.json({
      error: 'Calendar sync temporarily disabled'
    }, { status: 503 })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    return NextResponse.json({
      error: 'Calendar sync temporarily disabled'
    }, { status: 503 })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    return NextResponse.json({
      error: 'Calendar sync temporarily disabled'
    }, { status: 503 })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    return NextResponse.json({
      error: 'Calendar sync temporarily disabled'
    }, { status: 503 })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}