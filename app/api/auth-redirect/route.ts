import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    // Create response with redirect
    const response = NextResponse.redirect(new URL('/main', request.url))

    // Set cookie
    response.cookies.set({
      name: 'auth-token',
      value: token,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      sameSite: 'lax',
      secure: false
    })

    return response
  } catch (error) {
    console.error('Auth redirect error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}