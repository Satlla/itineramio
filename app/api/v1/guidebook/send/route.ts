import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiKey, hasPermission } from '@/lib/api-keys'
import { apiSuccess, apiError, apiRateLimited } from '@/lib/api-response'
import { publicApiRateLimiter } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/resend'
import React from 'react'
import { GuidebookDeliveryEmail, getDeliverySubject } from '@/emails/templates/guidebook-delivery'

export async function POST(request: NextRequest) {
  const auth = await requireApiKey(request)
  if (auth instanceof Response) return auth

  if (!hasPermission(auth, 'guidebook:write')) {
    return apiError('Missing permission: guidebook:write', 403)
  }

  const rateLimit = publicApiRateLimiter(`v1:guide-send:${auth.apiKeyId}`)
  if (!rateLimit.allowed) return apiRateLimited(rateLimit.resetIn)

  let body: any
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 400)
  }

  const { propertyId, guestEmail, guestName, language, reservationId } = body

  if (!propertyId || !guestEmail) {
    return apiError('Missing required fields: propertyId, guestEmail', 400)
  }

  // Validate email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
    return apiError('Invalid email address', 400)
  }

  // Verify property belongs to user
  const property = await prisma.property.findFirst({
    where: { id: propertyId, hostId: auth.userId, deletedAt: null },
    select: { id: true, name: true, slug: true },
  })

  if (!property) return apiError('Property not found', 404)

  // Anti-duplicate: check last 7 days
  const recentDelivery = await prisma.guidebookDelivery.findFirst({
    where: {
      propertyId,
      guestEmail,
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
  })

  if (recentDelivery) {
    return apiSuccess({
      deliveryId: recentDelivery.id,
      status: 'already_sent',
      message: 'Guidebook was already sent to this guest in the last 7 days.',
    })
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.itineramio.com'
  const guideUrl = property.slug
    ? `${baseUrl}/guide/${property.slug}`
    : `${baseUrl}/guide/${property.id}`

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { name: true },
  })

  const lang = (language === 'en' || language === 'fr') ? language : 'es'
  const subject = getDeliverySubject(property.name, lang)

  const result = await sendEmail({
    to: guestEmail,
    subject,
    react: React.createElement(GuidebookDeliveryEmail, {
      guestName: guestName || 'Guest',
      propertyName: property.name,
      guideUrl,
      hostName: user?.name || 'Tu anfitrión',
      language: lang as 'es' | 'en' | 'fr',
    }),
    tags: ['guidebook-delivery', propertyId],
  })

  const resendEmailId = result.success && result.data ? (result.data as any).id : null

  const delivery = await prisma.guidebookDelivery.create({
    data: {
      propertyId,
      reservationId: reservationId || null,
      guestEmail,
      guestName: guestName || null,
      language: lang,
      guideUrl,
      sentAt: result.success ? new Date() : null,
      resendEmailId,
      source: 'API',
    },
  })

  if (!result.success) {
    return apiError('Failed to send email. Delivery record created for retry.', 500)
  }

  return apiSuccess({
    deliveryId: delivery.id,
    guideUrl,
    status: 'sent',
  })
}
