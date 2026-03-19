import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimitAsync, getRateLimitKey } from '../../../../src/lib/rate-limit'

// Strip control characters to prevent log injection
function sanitize(value: unknown): string {
  if (typeof value !== 'string') return String(value ?? '')
  return value.replace(/[\x00-\x1f\x7f]/g, ' ').slice(0, 500)
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 30 requests per minute per IP
    const rlKey = getRateLimitKey(request, null, 'chatbot-error-log')
    const { success: rlOk } = await checkRateLimitAsync(rlKey, { maxRequests: 30, windowMs: 60 * 1000 })
    if (!rlOk) {
      return NextResponse.json({ ok: false }, { status: 429 })
    }

    const body = await request.json()
    // Logs appear in Vercel Functions → Runtime Logs
    console.error('[ChatBot:ErrorBoundary]', JSON.stringify({
      error: sanitize(body.error),
      serverError: sanitize(body.serverError),
      serverStatus: sanitize(body.serverStatus),
      stack: sanitize(body.stack),
      componentStack: sanitize(body.componentStack),
      ua: sanitize(body.ua),
      url: sanitize(body.url),
    }))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
