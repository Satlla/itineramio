import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../../src/lib/auth'

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

/**
 * GET /api/places/search?q=...&lat=...&lng=...
 * Server-side proxy for Google Places Text Search.
 * Avoids exposing the API key to the client.
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    if (!q || q.length < 2) {
      return NextResponse.json({ success: false, error: 'Query demasiado corta' }, { status: 400 })
    }

    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json({ success: false, error: 'Google Maps API key not configured' }, { status: 500 })
    }

    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(q)}&key=${GOOGLE_MAPS_API_KEY}&language=es`

    if (lat && lng) {
      url += `&location=${lat},${lng}&radius=15000`
    }

    const res = await fetch(url)
    const data = await res.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message)
      return NextResponse.json({ success: false, error: 'Error en búsqueda de Google Places' }, { status: 502 })
    }

    const results = (data.results || []).slice(0, 8).map((r: any) => ({
      googlePlaceId: r.place_id,
      name: r.name,
      address: r.formatted_address,
      lat: r.geometry?.location?.lat,
      lng: r.geometry?.location?.lng,
      rating: r.rating || null,
      photoUrl: r.photos?.[0]
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${r.photos[0].photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
        : null,
      types: r.types || [],
    }))

    return NextResponse.json({ success: true, data: results })
  } catch (error) {
    console.error('Error searching places:', error)
    return NextResponse.json({ success: false, error: 'Error en la búsqueda' }, { status: 500 })
  }
}
