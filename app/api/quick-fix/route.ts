import { NextResponse } from 'next/server'

export async function GET() {
  // Simple endpoint that always works
  return NextResponse.json({
    status: 'OK',
    message: 'API is working',
    timestamp: new Date().toISOString(),
    endpoints: {
      login: '/api/auth/simple-login',
      me: '/api/auth/me',
      users: '/api/list-users'
    }
  })
}