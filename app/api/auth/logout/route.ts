import { NextRequest, NextResponse } from 'next/server'

// GET removed - CSRF vulnerability (logout should only be POST)

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    })

    // Clear the auth token
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      expires: new Date(0),
      path: '/',
      maxAge: 0
    })

    // Clear admin impersonation cookie if exists
    response.cookies.set('admin-impersonation', '', {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      expires: new Date(0),
      path: '/',
      maxAge: 0
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}