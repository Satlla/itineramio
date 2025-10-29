import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import { getAuthUser } from '../../../../src/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Starting auth debug check');
    
    // Get user from token
    const authUser = await getAuthUser(request);
    console.log('🔍 Debug: Auth user from token:', authUser);
    
    if (!authUser) {
      return NextResponse.json({
        authenticated: false,
        error: 'No valid authentication token found',
        cookies: request.cookies.getAll(),
        headers: {
          authorization: request.headers.get('authorization'),
        }
      });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        isActive: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log('🔍 Debug: User from database:', dbUser);

    const debugInfo = {
      authenticated: true,
      tokenUser: {
        userId: authUser.userId,
        email: authUser.email,
        role: authUser.role,
      },
      databaseUser: dbUser,
      isAdmin: dbUser?.isAdmin || false,
      isActive: dbUser?.isActive || false,
      cookies: request.cookies.getAll(),
      headers: {
        authorization: request.headers.get('authorization'),
      },
      timestamp: new Date().toISOString()
    };

    console.log('🔍 Debug: Complete info:', debugInfo);
    
    return NextResponse.json(debugInfo);

  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    return NextResponse.json({ 
      error: 'Debug check failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      cookies: request.cookies.getAll(),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}