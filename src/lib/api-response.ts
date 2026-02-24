import { NextResponse } from 'next/server'

/**
 * Standard API success response
 */
export function apiSuccess(data: unknown, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

/**
 * Standard API error response
 */
export function apiError(error: string, status: number = 400) {
  return NextResponse.json({ success: false, error }, { status })
}

/**
 * Rate limited response with Retry-After header
 */
export function apiRateLimited(resetIn: number) {
  const retryAfterSeconds = Math.ceil(resetIn / 1000)
  return NextResponse.json(
    { success: false, error: 'Rate limit exceeded. Try again later.' },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfterSeconds) },
    }
  )
}

/**
 * Standard CORS headers for public API
 */
export function withCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key')
  return response
}
