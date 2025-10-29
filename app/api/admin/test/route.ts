import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Admin API is working',
    timestamp: new Date().toISOString(),
    headers: {
      cookie: request.headers.get('cookie'),
      authorization: request.headers.get('authorization')
    }
  })
}