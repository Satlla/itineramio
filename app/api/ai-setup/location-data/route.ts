import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../../src/lib/auth'
import { fetchAllLocationData } from '../../../../src/lib/ai-setup/places'

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const { lat, lng, city } = await request.json()

    if (!lat || !lng || !city) {
      return NextResponse.json(
        { success: false, error: 'lat, lng, and city are required' },
        { status: 400 }
      )
    }

    const data = await fetchAllLocationData(lat, lng, city)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[location-data] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error fetching location data',
      },
      { status: 500 }
    )
  }
}
