import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../src/lib/auth'
import { recrearManualSimple } from '../../../src/utils/recrearManualSimple'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { propertyId } = body

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId is required' }, { status: 400 })
    }

    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const success = await recrearManualSimple(propertyId)

    return NextResponse.json({ 
      success,
      message: success ? 'Manual recreado exitosamente' : 'Error recreando manual'
    })
  } catch (error) {
    console.error('Error in recreate-manual:', error)
    return NextResponse.json({ 
      error: 'Error recreating manual', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}