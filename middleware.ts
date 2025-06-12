import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key'
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production')
}

const protectedRoutes: string[] = [
  '/main',
  '/properties', 
  '/property-sets'
]

const authRoutes = [
  '/login',
  '/register'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      jwt.verify(token, JWT_SECRET as string)
    } catch (error) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      
      const response = NextResponse.redirect(loginUrl)
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        expires: new Date(0),
        path: '/'
      })
      
      return response
    }
  }

  if (isAuthRoute && token) {
    try {
      jwt.verify(token, JWT_SECRET as string)
      return NextResponse.redirect(new URL('/main', request.url))
    } catch (error) {
      const response = NextResponse.next()
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        expires: new Date(0),
        path: '/'
      })
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}