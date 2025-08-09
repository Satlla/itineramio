import * as jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'itineramio-secret-key-2024'

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET not set in environment variables. Using fallback.')
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}

export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  try {
    // Try Authorization header first
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      console.log('🔑 Attempting to verify Bearer token')
      const decoded = verifyToken(token)
      console.log('✅ Bearer token verified successfully')
      return decoded
    }

    // Fall back to cookie
    const cookieToken = request.cookies.get('auth-token')?.value
    if (cookieToken) {
      console.log('🍪 Attempting to verify cookie token')
      const decoded = verifyToken(cookieToken)
      console.log('✅ Cookie token verified successfully')
      return decoded
    }

    console.log('❌ No valid authentication token found')
    return null
  } catch (error) {
    console.error('❌ Auth token verification failed:', error instanceof Error ? error.message : error)
    return null
  }
}

export function createAuthResponse(message: string, status: number = 401) {
  return Response.json({ success: false, error: message }, { status })
}

export async function requireAuth(request: NextRequest): Promise<JWTPayload | Response> {
  const user = await getAuthUser(request)
  if (!user) {
    return createAuthResponse('No autorizado')
  }
  return user
}

export async function requireAdmin(request: NextRequest): Promise<JWTPayload | Response> {
  const userOrResponse = await requireAuth(request)
  if (userOrResponse instanceof Response) {
    return userOrResponse
  }

  // Check if user is admin in database
  const user = await prisma.user.findUnique({
    where: { id: userOrResponse.userId },
    select: { isAdmin: true }
  })

  if (!user || !user.isAdmin) {
    return createAuthResponse('Acceso denegado. Se requieren permisos de administrador', 403)
  }

  return userOrResponse
}