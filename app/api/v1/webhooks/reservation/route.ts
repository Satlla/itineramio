import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiKey, hasPermission } from '@/lib/api-keys'
import { apiSuccess, apiError, apiRateLimited } from '@/lib/api-response'
import { webhookRateLimiter } from '@/lib/rate-limit'
import { processWebhookEvent } from '@/lib/webhook-processor'

const VALID_EVENTS = ['reservation.created', 'reservation.modified', 'reservation.cancelled']

export async function POST(request: NextRequest) {
  const auth = await requireApiKey(request)
  if (auth instanceof Response) return auth

  if (!hasPermission(auth, 'webhooks:write')) {
    return apiError('Missing permission: webhooks:write', 403)
  }

  const rateLimit = webhookRateLimiter(`v1:webhook:${auth.apiKeyId}`)
  if (!rateLimit.allowed) return apiRateLimited(rateLimit.resetIn)

  let body: any
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 400)
  }

  // Validate payload
  const { event, reservation } = body

  if (!event || !VALID_EVENTS.includes(event)) {
    return apiError(`Invalid event. Valid: ${VALID_EVENTS.join(', ')}`, 400)
  }

  if (!reservation || typeof reservation !== 'object') {
    return apiError('Missing reservation object', 400)
  }

  if (!reservation.externalId) {
    return apiError('Missing reservation.externalId', 400)
  }

  if (!reservation.guestName) {
    return apiError('Missing reservation.guestName', 400)
  }

  if (!reservation.checkIn || !reservation.checkOut) {
    return apiError('Missing reservation.checkIn or reservation.checkOut', 400)
  }

  // Validate dates
  const checkIn = new Date(reservation.checkIn)
  const checkOut = new Date(reservation.checkOut)
  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    return apiError('Invalid date format for checkIn/checkOut. Use YYYY-MM-DD.', 400)
  }

  // Save webhook event (PENDING) and return 202 immediately
  const webhookEvent = await prisma.webhookEvent.create({
    data: {
      apiKeyId: auth.apiKeyId,
      eventType: event,
      payload: body,
      status: 'PENDING',
    },
  })

  // Process async (fire-and-forget)
  processWebhookEvent(webhookEvent.id, auth.userId).catch((error) => {
    console.error(`Async webhook processing failed for ${webhookEvent.id}:`, error)
  })

  return apiSuccess(
    {
      eventId: webhookEvent.id,
      status: 'PENDING',
      message: 'Webhook received. Processing asynchronously.',
    },
    202
  )
}
