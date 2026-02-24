import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../../src/lib/auth'
import { fetchAllLocationData } from '../../../../src/lib/ai-setup/places'
import { fetchNearbyPlaces } from '../../../../src/lib/recommendations'

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

    // Fetch directions and nearby places in parallel
    const [locationData, nearbyPlaces] = await Promise.all([
      fetchAllLocationData(lat, lng, city),
      fetchNearbyPlaces(lat, lng, undefined, city).catch(err => {
        console.error('[location-data] Error fetching nearby places:', err)
        return []
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        ...locationData,
        nearbyPlaces,
      },
    })
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
