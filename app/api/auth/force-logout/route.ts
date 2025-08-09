import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 Force logout requested');
    
    // Create response with cleared cookies
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logout forzado completado',
      timestamp: new Date().toISOString()
    });
    
    // Clear all possible auth cookies
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });
    
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });
    
    // Also clear any session cookies that might exist
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });
    
    console.log('✅ Force logout cookies cleared');
    
    return response;

  } catch (error) {
    console.error('❌ Force logout error:', error);
    return NextResponse.json({ 
      error: 'Force logout failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}