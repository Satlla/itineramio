import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 Admin logout requested')
    
    // Create response
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logout exitoso'
    })
    
    // Clear admin cookie
    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })

    // Clear admin impersonation cookie if exists
    response.cookies.set('admin-impersonation', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    console.log('✅ Admin logout successful (impersonation cookie también limpiado)')
    return response

  } catch (error) {
    console.error('❌ Admin logout error:', error)
    return NextResponse.json({ 
      error: 'Error durante el logout' 
    }, { status: 500 })
  }
}