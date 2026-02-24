import crypto from 'crypto'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

export interface ApiKeyPayload {
  userId: string
  apiKeyId: string
  permissions: string[]
}

/**
 * Generate a new API key with "itm_" prefix
 */
export function generateApiKey(): { rawKey: string; hashedKey: string; prefix: string } {
  const randomBytes = crypto.randomBytes(32).toString('hex')
  const rawKey = `itm_${randomBytes}`
  const hashedKey = hashApiKey(rawKey)
  const prefix = `itm_${randomBytes.substring(0, 8)}...`
  return { rawKey, hashedKey, prefix }
}

/**
 * Hash an API key using SHA-256 (fast, searchable by hash)
 */
export function hashApiKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex')
}

/**
 * Verify API key from request header
 * Returns payload or null if invalid
 */
export async function verifyApiKey(request: NextRequest): Promise<ApiKeyPayload | null> {
  const apiKey = request.headers.get('x-api-key')
  if (!apiKey) return null

  const hashedKey = hashApiKey(apiKey)

  const record = await prisma.apiKey.findUnique({
    where: { hashedKey },
    select: {
      id: true,
      userId: true,
      permissions: true,
      revokedAt: true,
    },
  })

  if (!record || record.revokedAt) return null

  // Update lastUsedAt (fire-and-forget)
  prisma.apiKey.update({
    where: { id: record.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {})

  const permissions = Array.isArray(record.permissions)
    ? (record.permissions as string[])
    : JSON.parse(record.permissions as string)

  return {
    userId: record.userId,
    apiKeyId: record.id,
    permissions,
  }
}

/**
 * Require a valid API key — returns payload or 401 Response
 */
export async function requireApiKey(request: NextRequest): Promise<ApiKeyPayload | Response> {
  const payload = await verifyApiKey(request)
  if (!payload) {
    return Response.json(
      { success: false, error: 'Invalid or revoked API key' },
      { status: 401 }
    )
  }
  return payload
}

/**
 * Check if API key has a specific permission
 */
export function hasPermission(payload: ApiKeyPayload, permission: string): boolean {
  return payload.permissions.includes(permission)
}
