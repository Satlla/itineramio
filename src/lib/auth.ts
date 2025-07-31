import * as jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

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
      const decoded = verifyToken(token)
      return decoded
    }

    // Fall back to cookie
    const cookieToken = request.cookies.get('auth-token')?.value
    if (cookieToken) {
      const decoded = verifyToken(cookieToken)
      return decoded
    }

    return null
  } catch (error) {
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

  if (userOrResponse.role !== 'ADMIN') {
    return createAuthResponse('Acceso denegado. Se requieren permisos de administrador', 403)
  }

  return userOrResponse
}