import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiKey, hasPermission } from '@/lib/api-keys'
import { apiSuccess, apiError, apiRateLimited } from '@/lib/api-response'
import { publicApiRateLimiter } from '@/lib/rate-limit'

const VALID_PLATFORMS = ['cloudbeds', 'amenitiz', 'siteminder', 'hostaway', 'guesty', 'other']

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiKey(request)
  if (auth instanceof Response) return auth

  if (!hasPermission(auth, 'properties:read')) {
    return apiError('Missing permission: properties:read', 403)
  }

  const rateLimit = publicApiRateLimiter(`v1:mappings:${auth.apiKeyId}`)
  if (!rateLimit.allowed) return apiRateLimited(rateLimit.resetIn)

  const { id } = await params

  // Verify property belongs to user
  const property = await prisma.property.findFirst({
    where: { id, hostId: auth.userId, deletedAt: null },
    select: { id: true },
  })
  if (!property) return apiError('Property not found', 404)

  const mappings = await prisma.propertyExternalMapping.findMany({
    where: { propertyId: id },
    select: {
      id: true,
      platform: true,
      externalId: true,
      externalName: true,
      createdAt: true,
    },
  })

  return apiSuccess(mappings)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiKey(request)
  if (auth instanceof Response) return auth

  if (!hasPermission(auth, 'properties:read')) {
    return apiError('Missing permission: properties:read', 403)
  }

  const rateLimit = publicApiRateLimiter(`v1:mappings:${auth.apiKeyId}`)
  if (!rateLimit.allowed) return apiRateLimited(rateLimit.resetIn)

  const { id } = await params

  const property = await prisma.property.findFirst({
    where: { id, hostId: auth.userId, deletedAt: null },
    select: { id: true },
  })
  if (!property) return apiError('Property not found', 404)

  let body: any
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 400)
  }

  const { platform, externalId, externalName } = body

  if (!platform || !externalId) {
    return apiError('Missing required fields: platform, externalId', 400)
  }

  if (!VALID_PLATFORMS.includes(platform)) {
    return apiError(`Invalid platform. Valid: ${VALID_PLATFORMS.join(', ')}`, 400)
  }

  try {
    const mapping = await prisma.propertyExternalMapping.upsert({
      where: { propertyId_platform: { propertyId: id, platform } },
      create: {
        propertyId: id,
        platform,
        externalId,
        externalName: externalName || null,
      },
      update: {
        externalId,
        externalName: externalName || null,
      },
    })

    return apiSuccess(mapping, 201)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return apiError('This external ID is already mapped to another property', 409)
    }
    throw error
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiKey(request)
  if (auth instanceof Response) return auth

  if (!hasPermission(auth, 'properties:read')) {
    return apiError('Missing permission: properties:read', 403)
  }

  const rateLimit = publicApiRateLimiter(`v1:mappings:${auth.apiKeyId}`)
  if (!rateLimit.allowed) return apiRateLimited(rateLimit.resetIn)

  const { id } = await params

  const property = await prisma.property.findFirst({
    where: { id, hostId: auth.userId, deletedAt: null },
    select: { id: true },
  })
  if (!property) return apiError('Property not found', 404)

  const { searchParams } = new URL(request.url)
  const platform = searchParams.get('platform')

  if (!platform) {
    return apiError('Missing query parameter: platform', 400)
  }

  const existing = await prisma.propertyExternalMapping.findUnique({
    where: { propertyId_platform: { propertyId: id, platform } },
  })

  if (!existing) return apiError('Mapping not found', 404)

  await prisma.propertyExternalMapping.delete({
    where: { propertyId_platform: { propertyId: id, platform } },
  })

  return apiSuccess({ deleted: true })
}
