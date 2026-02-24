import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getRateLimitKey } from '../../../../src/lib/rate-limit'
import { fetchAllLocationData } from '../../../../src/lib/ai-setup/places'
import { fetchNearbyPlaces } from '../../../../src/lib/recommendations'

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 requests per IP per 24h
    const rateLimitKey = getRateLimitKey(request, null, 'demo-location')
    const rateCheck = checkRateLimit(rateLimitKey, {
      maxRequests: 5,
      windowMs: 24 * 60 * 60 * 1000,
    })
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Has alcanzado el límite de consultas de ubicación. Vuelve mañana.' },
        { status: 429 }
      )
    }

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
        console.error('[demo-location-data] Error fetching nearby places:', err)
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
    console.error('[demo-location-data] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error fetching location data',
      },
      { status: 500 }
    )
  }
}
