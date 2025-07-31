import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes: string[] = [
  '/main',
  '/properties', 
  '/property-sets',
  '/admin',
  '/analytics',
  '/account',
  '/media-library'
]

const authRoutes = [
  '/login',
  '/register'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  // Handle slug-based URL resolution by rewriting to dynamic routes
  const rewriteResponse = handleSlugRewrite(request)
  if (rewriteResponse) {
    return rewriteResponse
  }
  
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

function handleSlugRewrite(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  
  // Handle clean URLs by rewriting them to the existing dynamic route structure
  // This allows us to keep existing route handlers while supporting clean URLs
  
  // Skip reserved routes
  const reservedPropertyRoutes = ['new', 'slug', 'groups']
  
  // Pattern: /properties/[slug] -> /properties/[id]
  const propertyMatch = pathname.match(/^\/properties\/([^\/]+)$/)
  if (propertyMatch) {
    const identifier = propertyMatch[1]
    if (!reservedPropertyRoutes.includes(identifier)) {
      // If it doesn't look like a CUID, it's likely a slug
      if (!identifier.match(/^c[a-z0-9]{24,}$/i)) {
        // Rewrite to a special slug route
        const url = request.nextUrl.clone()
        url.pathname = `/properties/slug/${identifier}`
        return NextResponse.rewrite(url)
      }
    }
  }
  
  // Pattern: /properties/[slug]/zones -> /properties/[id]/zones
  const propertyZonesMatch = pathname.match(/^\/properties\/([^\/]+)\/zones$/)
  if (propertyZonesMatch) {
    const identifier = propertyZonesMatch[1]
    // Skip reserved routes
    if (!reservedPropertyRoutes.includes(identifier)) {
      if (!identifier.match(/^c[a-z0-9]{24,}$/i)) {
        const url = request.nextUrl.clone()
        url.pathname = `/properties/slug/${identifier}/zones`
        return NextResponse.rewrite(url)
      }
    }
  }
  
  // Pattern: /properties/[slug]/zones/[zoneSlug] -> /properties/[id]/zones/[id]
  const zoneMatch = pathname.match(/^\/properties\/([^\/]+)\/zones\/([^\/]+)$/)
  if (zoneMatch) {
    const propertyIdentifier = zoneMatch[1]
    const zoneIdentifier = zoneMatch[2]
    
    // Skip reserved routes
    if (!reservedPropertyRoutes.includes(propertyIdentifier)) {
      // If either is not a CUID, treat as slug
      if (!propertyIdentifier.match(/^c[a-z0-9]{24,}$/i) || !zoneIdentifier.match(/^c[a-z0-9]{24,}$/i)) {
        const url = request.nextUrl.clone()
        url.pathname = `/properties/slug/${propertyIdentifier}/zones/${zoneIdentifier}`
        return NextResponse.rewrite(url)
      }
    }
  }
  
  // Pattern: /properties/[slug]/[zoneSlug] (direct zone access)
  const directZoneMatch = pathname.match(/^\/properties\/([^\/]+)\/([^\/]+)$/)
  if (directZoneMatch && !pathname.includes('/zones/')) {
    const propertyIdentifier = directZoneMatch[1]
    const zoneIdentifier = directZoneMatch[2]
    
    // Skip if property identifier is reserved
    if (!reservedPropertyRoutes.includes(propertyIdentifier)) {
      // Skip if this looks like other routes (like 'zones', 'settings', etc.)
      const reservedRoutes = ['zones', 'settings', 'analytics', 'steps', 'qr', 'new', 'announcements', 'evaluations']
      if (!reservedRoutes.includes(zoneIdentifier)) {
        const url = request.nextUrl.clone()
        url.pathname = `/properties/slug/${propertyIdentifier}/zone/${zoneIdentifier}`
        return NextResponse.rewrite(url)
      }
    }
  }
  
  return null
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public|login|register).*)',
  ],
}