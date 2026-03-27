import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimitAsync } from '../../../../src/lib/rate-limit'

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = await checkRateLimitAsync(`demo-places:${ip}`, { maxRequests: 30, windowMs: 60 * 1000 })
    if (!allowed) return NextResponse.json({ success: false, error: 'Demasiadas búsquedas' }, { status: 429 })

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    if (!q || q.length < 2) {
      return NextResponse.json({ success: false, error: 'Query demasiado corta' }, { status: 400 })
    }

    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json({ success: false, error: 'Google Maps no configurado' }, { status: 500 })
    }

    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(q)}&key=${GOOGLE_MAPS_API_KEY}&language=es`
    if (lat && lng) url += `&location=${lat},${lng}&radius=15000`

    const res = await fetch(url)
    const data = await res.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return NextResponse.json({ success: false, error: 'Error en búsqueda' }, { status: 502 })
    }

    const results = (data.results || []).slice(0, 8).map((r: { place_id: string; name: string; formatted_address: string; rating?: number; price_level?: number; geometry?: { location?: { lat: number; lng: number } }; photos?: { photo_reference: string }[]; opening_hours?: { open_now?: boolean }; types?: string[] }) => ({
      googlePlaceId: r.place_id,
      name: r.name,
      address: r.formatted_address,
      lat: r.geometry?.location?.lat,
      lng: r.geometry?.location?.lng,
      rating: r.rating || null,
      photoUrl: null,
      photoUrls: [],
      priceLevel: r.price_level ?? null,
      openNow: r.opening_hours?.open_now ?? null,
      types: r.types || [],
    }))

    return NextResponse.json({ success: true, data: results })
  } catch {
    return NextResponse.json({ success: false, error: 'Error en la búsqueda' }, { status: 500 })
  }
}
