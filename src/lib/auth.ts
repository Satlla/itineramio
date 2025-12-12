import * as jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'
import { getAdminUser } from './admin-auth'

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

export function signToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  rememberMe: boolean = false
): string {
  // Si rememberMe es true, la sesión dura 30 días. Si no, 24 horas.
  const expiresIn = rememberMe ? '30d' : '24h'
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
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

// Nueva función: permite bypass de admin
export async function requireAuthOrAdmin(request: NextRequest): Promise<JWTPayload | Response> {
  // Primero intenta autenticación normal de usuario
  const user = await getAuthUser(request)
  if (user) {
    return user
  }

  // Si no hay usuario normal, verifica si es admin
  const admin = await getAdminUser(request)
  if (admin) {
    // Si es admin, verifica que está en una ruta permitida
    const url = new URL(request.url)
    const isPropertyRoute = url.pathname.includes('/properties/') && url.pathname.includes('/zones')
    
    if (isPropertyRoute) {
      // Extraer propertyId de la URL
      const pathParts = url.pathname.split('/')
      const propertyIndex = pathParts.indexOf('properties')
      const propertyId = pathParts[propertyIndex + 1]
      
      if (propertyId) {
        // Buscar el propietario de la propiedad
        const property = await prisma.property.findUnique({
          where: { id: propertyId },
          select: { hostId: true, host: { select: { email: true } } }
        })
        
        if (property) {
          // Crear un JWTPayload simulado del propietario para el admin
          return {
            userId: property.hostId,
            email: property.host.email,
            role: 'HOST' // Simula ser el host
          } as JWTPayload
        }
      }
    }
  }

  return createAuthResponse('No autorizado')
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