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

  if (!hasPermission(auth, 'guidebook:read')) {
    return apiError('Missing permission: guidebook:read', 403)
  }

  const rateLimit = publicApiRateLimiter(`v1:guide-status:${auth.apiKeyId}`)
  if (!rateLimit.allowed) return apiRateLimited(rateLimit.resetIn)

  const { id } = await params

  const delivery = await prisma.guidebookDelivery.findUnique({
    where: { id },
    include: {
      property: { select: { hostId: true, name: true } },
    },
  })

  if (!delivery || delivery.property.hostId !== auth.userId) {
    return apiError('Delivery not found', 404)
  }

  let status = 'pending'
  if (delivery.clickedAt) status = 'clicked'
  else if (delivery.openedAt) status = 'opened'
  else if (delivery.sentAt) status = 'sent'

  return apiSuccess({
    id: delivery.id,
    propertyName: delivery.property.name,
    guestEmail: delivery.guestEmail,
    guestName: delivery.guestName,
    guideUrl: delivery.guideUrl,
    status,
    sentAt: delivery.sentAt,
    openedAt: delivery.openedAt,
    clickedAt: delivery.clickedAt,
    createdAt: delivery.createdAt,
  })
}
