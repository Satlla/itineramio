import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const MOBILE_DEV_ORIGINS = ['http://localhost:8081', 'http://127.0.0.1:8081']

function addCorsHeaders(response: NextResponse, origin: string): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

const protectedRoutes: string[] = [
  '/main',
  '/properties',
  '/property-sets',
  '/analytics',
  '/account',
  '/media-library',
  '/gestion',
  '/ai-setup',
  // Note: /admin removed - handled separately
]

const authRoutes = [
  '/login',
  '/register'
]

async function verifyJWT(token: string, secret: string): Promise<boolean> {
  try {
    const key = new TextEncoder().encode(secret)
    await jwtVerify(token, key)
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const origin = request.headers.get('origin') ?? ''

  // Handle CORS for mobile app dev (Expo web on localhost)
  if (MOBILE_DEV_ORIGINS.includes(origin) && pathname.startsWith('/api/')) {
    if (request.method === 'OPTIONS') {
      return addCorsHeaders(new NextResponse(null, { status: 204 }), origin)
    }
    // For non-OPTIONS API requests from mobile dev, add headers and continue to the API handler
    const res = NextResponse.next()
    addCorsHeaders(res, origin)
    return res
  }

  // Skip middleware for API routes (they handle their own auth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth-token')?.value

  // SATLLABOT PANEL
  if (pathname === '/satllabot/login') return NextResponse.next()
  if (pathname.startsWith('/satllabot')) {
    const panelToken = request.cookies.get('satllabot-token')?.value
    if (!panelToken) return NextResponse.redirect(new URL('/satllabot/login', request.url))
    const panelSecret = process.env.SATLLABOT_PANEL_SECRET
    if (panelSecret) {
      const valid = await verifyJWT(panelToken, panelSecret)
      if (!valid) {
        const res = NextResponse.redirect(new URL('/satllabot/login', request.url))
        res.cookies.delete('satllabot-token')
        return res
      }
    }
    return NextResponse.next()
  }

  // CRITICAL: Allow admin login page to bypass all checks
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login')) {
    return NextResponse.next()
  }

  // Handle all admin routes separately
  if (pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get('admin-token')?.value
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    // Verify admin token signature in Edge Runtime
    const adminSecret = process.env.ADMIN_JWT_SECRET
    if (adminSecret) {
      const valid = await verifyJWT(adminToken, adminSecret)
      if (!valid) {
        const response = NextResponse.redirect(new URL('/admin/login', request.url))
        response.cookies.delete('admin-token')
        return response
      }
    }
    return NextResponse.next()
  }

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

  // Si el usuario tiene token y está en la raíz o en /demo, redirigir a /main
  if ((pathname === '/' || pathname === '/demo') && token) {
    // Verify token is valid before redirecting
    const jwtSecret = process.env.JWT_SECRET
    if (jwtSecret && await verifyJWT(token, jwtSecret)) {
      return NextResponse.redirect(new URL('/main', request.url))
    }
  }

  if (isProtectedRoute) {
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
    // Verify JWT signature and expiry in Edge Runtime using jose
    const jwtSecret = process.env.JWT_SECRET
    if (jwtSecret) {
      const valid = await verifyJWT(token, jwtSecret)
      if (!valid) {
        // Token expired or invalid — clear cookie and redirect to login
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('from', pathname)
        loginUrl.searchParams.set('expired', '1')
        const response = NextResponse.redirect(loginUrl)
        response.cookies.delete('auth-token')
        return response
      }
    }
  }

  if (isAuthRoute && token) {
    // Verify token is valid before redirecting away from auth pages
    const jwtSecret = process.env.JWT_SECRET
    if (jwtSecret && await verifyJWT(token, jwtSecret)) {
      return NextResponse.redirect(new URL('/main', request.url))
    }
  }

  return NextResponse.next()
}

function handleSlugRewrite(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  
  // Handle clean URLs by rewriting them to the existing dynamic route structure
  // This allows us to keep existing route handlers while supporting clean URLs
  
  // Skip reserved routes
  const reservedPropertyRoutes = ['new', 'slug', 'groups', 'ai-setup']
  
  // Pattern: /properties/[slug] -> /properties/[id]
  const propertyMatch = pathname.match(/^\/properties\/([^\/]+)$/)
  if (propertyMatch) {
    const identifier = propertyMatch[1]
    if (!reservedPropertyRoutes.includes(identifier)) {
      // If it doesn't look like a CUID or property ID, it's likely a slug
      if (!identifier.match(/^(c[a-z0-9]{24,}|prop-[0-9]+-[a-z0-9]+)$/i)) {
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
      if (!identifier.match(/^(c[a-z0-9]{24,}|prop-[0-9]+-[a-z0-9]+)$/i)) {
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
      // If either is not a CUID or property/zone ID, treat as slug
      if (!propertyIdentifier.match(/^(c[a-z0-9]{24,}|prop-[0-9]+-[a-z0-9]+)$/i) || !zoneIdentifier.match(/^(c[a-z0-9]{24,}|zone-[a-z0-9]+-[0-9]+)$/i)) {
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
      // Skip if this looks like other dashboard routes - DO NOT REWRITE THESE
      const reservedRoutes = ['zones', 'settings', 'analytics', 'steps', 'qr', 'new', 'announcements', 'evaluations', 'chatbot', 'intelligence']
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
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}