import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/public/place-photo?url=<encoded_google_photo_url>
 *
 * Proxy for Google Places photo URLs. The Google Places Photo API requires
 * a server-side API key that has IP restrictions — it cannot be called
 * directly from the browser. This route fetches the image server-side
 * and streams it back to the client with aggressive caching.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const encodedUrl = searchParams.get('url')

  if (!encodedUrl) {
    return new NextResponse('Missing url param', { status: 400 })
  }

  let photoUrl: string
  try {
    photoUrl = decodeURIComponent(encodedUrl)
  } catch {
    return new NextResponse('Invalid url param', { status: 400 })
  }

  // Only proxy Google Maps photo URLs
  if (!photoUrl.startsWith('https://maps.googleapis.com/maps/api/place/photo')) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const response = await fetch(photoUrl, {
      headers: { 'User-Agent': 'Itineramio/1.0' },
    })

    if (!response.ok) {
      return new NextResponse('Photo not found', { status: response.status })
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Cache aggressively — Google Places photos don't change
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'CDN-Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return new NextResponse('Failed to fetch photo', { status: 502 })
  }
}
