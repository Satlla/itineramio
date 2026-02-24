import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiKey, hasPermission } from '@/lib/api-keys'
import { apiSuccess, apiError, apiRateLimited } from '@/lib/api-response'
import { publicApiRateLimiter } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const auth = await requireApiKey(request)
  if (auth instanceof Response) return auth

  if (!hasPermission(auth, 'properties:read')) {
    return apiError('Missing permission: properties:read', 403)
  }

  const rateLimit = publicApiRateLimiter(`v1:props:${auth.apiKeyId}`)
  if (!rateLimit.allowed) return apiRateLimited(rateLimit.resetIn)

  const properties = await prisma.property.findMany({
    where: { hostId: auth.userId, deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      isPublished: true,
      city: true,
      country: true,
      type: true,
      externalMappings: {
        select: {
          id: true,
          platform: true,
          externalId: true,
          externalName: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.itineramio.com'
  const data = properties.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    guideUrl: p.slug ? `${baseUrl}/guide/${p.slug}` : `${baseUrl}/guide/${p.id}`,
    isPublished: p.isPublished,
    city: p.city,
    country: p.country,
    type: p.type,
    mappings: p.externalMappings,
  }))

  return apiSuccess(data)
}
