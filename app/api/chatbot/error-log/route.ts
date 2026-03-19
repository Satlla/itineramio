import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimitAsync, getRateLimitKey } from '../../../../src/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 30 requests per minute per IP
    const rlKey = getRateLimitKey(request, null, 'chatbot-error-log')
    const { success: rlOk } = await checkRateLimitAsync(rlKey, { maxRequests: 30, windowMs: 60 * 1000 })
    if (!rlOk) {
      return NextResponse.json({ ok: false }, { status: 429 })
    }

    await request.json()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
