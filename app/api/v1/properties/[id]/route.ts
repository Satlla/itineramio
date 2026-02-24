import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiKey, hasPermission } from '@/lib/api-keys'
import { apiSuccess, apiError, apiRateLimited } from '@/lib/api-response'
import { publicApiRateLimiter } from '@/lib/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiKey(request)
  if (auth instanceof Response) return auth

  if (!hasPermission(auth, 'properties:read')) {
    return apiError('Missing permission: properties:read', 403)
  }

  const rateLimit = publicApiRateLimiter(`v1:prop:${auth.apiKeyId}`)
  if (!rateLimit.allowed) return apiRateLimited(rateLimit.resetIn)

  const { id } = await params

  const property = await prisma.property.findFirst({
    where: { id, hostId: auth.userId, deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      isPublished: true,
      city: true,
      state: true,
      country: true,
      type: true,
      bedrooms: true,
      bathrooms: true,
      maxGuests: true,
      hostContactName: true,
      hostContactEmail: true,
      hostContactPhone: true,
      externalMappings: {
        select: {
          id: true,
          platform: true,
          externalId: true,
          externalName: true,
        },
      },
      zones: {
        where: { isPublished: true },
        select: {
          id: true,
          name: true,
          icon: true,
          type: true,
          slug: true,
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!property) {
    return apiError('Property not found', 404)
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.itineramio.com'
  return apiSuccess({
    ...property,
    guideUrl: property.slug
      ? `${baseUrl}/guide/${property.slug}`
      : `${baseUrl}/guide/${property.id}`,
  })
}
