import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Logs appear in Vercel Functions → Runtime Logs
    console.error('[ChatBot:ErrorBoundary]', JSON.stringify({
      error: body.error,
      serverError: body.serverError,
      serverStatus: body.serverStatus,
      stack: body.stack,
      componentStack: body.componentStack,
      ua: body.ua,
      url: body.url,
    }))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
