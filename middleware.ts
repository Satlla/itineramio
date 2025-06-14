import { NextRequest, NextResponse } from 'next/server'

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
    // In Edge Runtime, we can't verify JWT properly
    // The actual verification happens in the API routes
  }

  if (isAuthRoute && token) {
    // If user has token and tries to access auth routes, redirect to main
    return NextResponse.redirect(new URL('/main', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public|login|register).*)',
  ],
}