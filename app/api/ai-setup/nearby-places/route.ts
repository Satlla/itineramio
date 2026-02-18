import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../../src/lib/auth'
import { searchNearbyPlaces, getPlaceDetails } from '../../../../src/lib/ai-setup/places'

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const { lat, lng, type, radius, maxResults } = await request.json()

    if (!lat || !lng || !type) {
      return NextResponse.json(
        { success: false, error: 'lat, lng, and type are required' },
        { status: 400 }
      )
    }

    const places = await searchNearbyPlaces(lat, lng, type, radius || 1500, maxResults || 5)

    return NextResponse.json({ success: true, data: places })
  } catch (error) {
    console.error('[nearby-places] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error fetching nearby places',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const { searchParams } = new URL(request.url)
    const placeId = searchParams.get('placeId')

    if (!placeId) {
      return NextResponse.json(
        { success: false, error: 'placeId is required' },
        { status: 400 }
      )
    }

    const details = await getPlaceDetails(placeId)

    if (!details) {
      return NextResponse.json(
        { success: false, error: 'Place not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: details })
  } catch (error) {
    console.error('[nearby-places] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error fetching place details',
      },
      { status: 500 }
    )
  }
}
