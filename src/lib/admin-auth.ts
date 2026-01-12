import * as jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET

if (!ADMIN_JWT_SECRET) {
  throw new Error('CRITICAL: ADMIN_JWT_SECRET environment variable is not set. Application cannot start securely.')
}

export interface AdminJWTPayload {
  adminId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export function signAdminToken(payload: Omit<AdminJWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, ADMIN_JWT_SECRET, { expiresIn: '8h' })
}

export function verifyAdminToken(token: string): AdminJWTPayload {
  return jwt.verify(token, ADMIN_JWT_SECRET) as AdminJWTPayload
}

export async function getAdminUser(request: NextRequest): Promise<AdminJWTPayload | null> {
  try {
    console.log('🔍 All cookies:', request.cookies.toString())
    
    // Check for admin-token cookie
    const adminToken = request.cookies.get('admin-token')?.value
    console.log('🔐 Admin token found:', !!adminToken)
    
    if (adminToken) {
      console.log('🔐 Attempting to verify admin token')
      const decoded = verifyAdminToken(adminToken)
      console.log('✅ Admin token verified successfully for:', decoded.email)
      return decoded
    }

    console.log('❌ No admin authentication token found')
    return null
  } catch (error) {
    console.error('❌ Admin token verification failed:', error instanceof Error ? error.message : error)
    return null
  }
}

export function createAdminAuthResponse(message: string, status: number = 401) {
  return Response.json({ success: false, error: message }, { status })
}

export async function requireAdminAuth(request: NextRequest): Promise<AdminJWTPayload | Response> {
  const admin = await getAdminUser(request)
  if (!admin) {
    return createAdminAuthResponse('No autorizado - Acceso administrativo requerido', 401)
  }
  return admin
}

export async function requireSuperAdmin(request: NextRequest): Promise<AdminJWTPayload | Response> {
  const adminOrResponse = await requireAdminAuth(request)
  if (adminOrResponse instanceof Response) {
    return adminOrResponse
  }

  // Check if admin is super admin
  const admin = await prisma.admin.findUnique({
    where: { id: adminOrResponse.adminId },
    select: { role: true }
  })

  if (!admin || admin.role !== 'SUPER_ADMIN') {
    return createAdminAuthResponse('Acceso denegado. Se requieren permisos de super administrador', 403)
  }

  return adminOrResponse
}

export async function validateAdminPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function hashAdminPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export interface VerifyAdminAuthResult {
  isAuthenticated: boolean
  admin?: AdminJWTPayload
}

export async function verifyAdminAuth(request: NextRequest): Promise<VerifyAdminAuthResult> {
  const admin = await getAdminUser(request)
  if (!admin) {
    return { isAuthenticated: false }
  }
  return { isAuthenticated: true, admin }
}