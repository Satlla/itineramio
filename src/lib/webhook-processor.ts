import { prisma } from './prisma'
import { findBestMatch, type BillingUnitConfig, findBestBillingUnitMatch } from './property-matcher'
import { sendEmail, FROM_EMAIL, REPLY_TO_EMAIL } from './resend'
import { render } from '@react-email/render'
import React from 'react'
import { GuidebookDeliveryEmail, getDeliverySubject } from '@/emails/templates/guidebook-delivery'

interface ReservationPayload {
  externalId: string
  propertyExternalId?: string
  propertyName?: string
  guestName: string
  guestEmail?: string
  checkIn: string
  checkOut: string
  platform: string
  confirmationCode?: string
  hostEarnings?: number
}

interface PropertyMatch {
  propertyId: string
  propertyName: string
  slug: string | null
  billingUnitId?: string
}

/**
 * Process a webhook event end-to-end:
 * 1. Match property
 * 2. Create reservation in gestion (if module active)
 * 3. Send guidebook to guest
 */
export async function processWebhookEvent(eventId: string, userId: string) {
  const event = await prisma.webhookEvent.findUnique({ where: { id: eventId } })
  if (!event) return

  await prisma.webhookEvent.update({
    where: { id: eventId },
    data: { status: 'PROCESSING' },
  })

  try {
    const payload = event.payload as any
    const reservation: ReservationPayload = payload.reservation

    // Step 1: Match property
    const match = await matchReservationToProperty(
      userId,
      reservation.propertyExternalId,
      reservation.propertyName,
      reservation.platform
    )

    if (!match) {
      await prisma.webhookEvent.update({
        where: { id: eventId },
        data: {
          status: 'FAILED',
          error: 'No matching property found',
          processedAt: new Date(),
        },
      })
      return
    }

    // Step 2: Create reservation in gestion if module is active
    const hasGestion = await prisma.userModule.findFirst({
      where: { userId, moduleType: 'GESTION', isActive: true },
    })

    let reservationId: string | undefined

    if (hasGestion && match.billingUnitId) {
      reservationId = await createGestionReservation(userId, reservation, match)
    }

    // Step 3: Send guidebook to guest
    if (reservation.guestEmail) {
      await sendGuidebookToGuest({
        propertyId: match.propertyId,
        email: reservation.guestEmail,
        name: reservation.guestName,
        language: 'es',
        reservationId,
        slug: match.slug,
        propertyName: match.propertyName,
        userId,
      })
    }

    await prisma.webhookEvent.update({
      where: { id: eventId },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
      },
    })
  } catch (error) {
    console.error(`Error processing webhook event ${eventId}:`, error)
    await prisma.webhookEvent.update({
      where: { id: eventId },
      data: {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        processedAt: new Date(),
      },
    })
  }
}

/**
 * Match reservation to a property using multiple strategies:
 * 1. PropertyExternalMapping (exact by externalId + platform)
 * 2. Fuzzy match via property-matcher (Levenshtein)
 * 3. BillingUnit airbnbNames/bookingNames matching
 */
async function matchReservationToProperty(
  userId: string,
  externalId?: string,
  propertyName?: string,
  platform?: string
): Promise<PropertyMatch | null> {
  // Priority 1: Exact match by external mapping
  if (externalId && platform) {
    const mapping = await prisma.propertyExternalMapping.findUnique({
      where: { platform_externalId: { platform, externalId } },
      include: {
        property: { select: { id: true, name: true, slug: true, hostId: true } },
      },
    })

    if (mapping && mapping.property.hostId === userId) {
      // Try to find matching BillingUnit for gestion
      const billingUnit = await findBillingUnitForProperty(userId, mapping.property.name, platform)
      return {
        propertyId: mapping.property.id,
        propertyName: mapping.property.name,
        slug: mapping.property.slug,
        billingUnitId: billingUnit?.id,
      }
    }
  }

  // Priority 2: Fuzzy match by property name
  if (propertyName) {
    const properties = await prisma.property.findMany({
      where: { hostId: userId, deletedAt: null },
      select: { id: true, name: true, slug: true },
    })

    const configs = properties.map((p) => ({
      id: p.id,
      propertyId: p.id,
      propertyName: p.name,
      airbnbNames: [] as string[],
      bookingNames: [] as string[],
      vrboNames: [] as string[],
    }))

    const normalizedPlatform = platform === 'booking' ? 'booking' : platform === 'vrbo' ? 'vrbo' : 'airbnb'
    const best = findBestMatch(propertyName, configs, normalizedPlatform as any, 60)

    if (best) {
      const matched = properties.find((p) => p.id === best.propertyId)
      if (matched) {
        const billingUnit = await findBillingUnitForProperty(userId, propertyName, platform)
        return {
          propertyId: matched.id,
          propertyName: matched.name,
          slug: matched.slug,
          billingUnitId: billingUnit?.id,
        }
      }
    }
  }

  // Priority 3: BillingUnit name matching (for gestion users who may not have Property-level match)
  if (propertyName && platform) {
    const billingUnit = await findBillingUnitForProperty(userId, propertyName, platform)
    if (billingUnit) {
      // Try to find a property that shares the billing unit name
      const property = await prisma.property.findFirst({
        where: { hostId: userId, name: { contains: billingUnit.name, mode: 'insensitive' }, deletedAt: null },
        select: { id: true, name: true, slug: true },
      })
      if (property) {
        return {
          propertyId: property.id,
          propertyName: property.name,
          slug: property.slug,
          billingUnitId: billingUnit.id,
        }
      }
    }
  }

  return null
}

async function findBillingUnitForProperty(
  userId: string,
  propertyName: string,
  platform?: string
): Promise<{ id: string; name: string } | null> {
  const billingUnits = await prisma.billingUnit.findMany({
    where: { userId, isActive: true },
    select: { id: true, name: true, airbnbNames: true, bookingNames: true, vrboNames: true },
  })

  if (billingUnits.length === 0) return null

  const configs: BillingUnitConfig[] = billingUnits.map((bu) => ({
    id: bu.id,
    name: bu.name,
    airbnbNames: bu.airbnbNames,
    bookingNames: bu.bookingNames,
    vrboNames: bu.vrboNames,
  }))

  const normalizedPlatform = platform === 'booking' ? 'booking' : platform === 'vrbo' ? 'vrbo' : 'airbnb'
  const best = findBestBillingUnitMatch(propertyName, configs, normalizedPlatform as any, 60)

  if (best) {
    return { id: best.billingUnitId, name: best.billingUnitName }
  }
  return null
}

/**
 * Create a reservation in the gestion module
 */
async function createGestionReservation(
  userId: string,
  reservation: ReservationPayload,
  match: PropertyMatch
): Promise<string | undefined> {
  try {
    const checkIn = new Date(reservation.checkIn)
    const checkOut = new Date(reservation.checkOut)
    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
    const earnings = reservation.hostEarnings || 0

    // Guest CRM: find or create guest
    let guestId: string | null = null
    if (reservation.guestEmail) {
      const existingGuest = await prisma.guest.findFirst({
        where: { userId, email: reservation.guestEmail },
      })
      if (existingGuest) {
        guestId = existingGuest.id
      } else {
        const newGuest = await prisma.guest.create({
          data: {
            userId,
            name: reservation.guestName,
            email: reservation.guestEmail,
          },
        })
        guestId = newGuest.id
      }
    }

    const platformMap: Record<string, string> = {
      cloudbeds: 'OTHER',
      amenitiz: 'OTHER',
      siteminder: 'OTHER',
      airbnb: 'AIRBNB',
      booking: 'BOOKING',
      vrbo: 'VRBO',
    }
    const reservationPlatform = platformMap[reservation.platform?.toLowerCase()] || 'OTHER'

    const created = await prisma.reservation.create({
      data: {
        userId,
        billingUnitId: match.billingUnitId || null,
        guestId,
        platform: reservationPlatform as any,
        confirmationCode: reservation.confirmationCode || reservation.externalId,
        guestName: reservation.guestName,
        guestEmail: reservation.guestEmail,
        checkIn,
        checkOut,
        nights,
        hostEarnings: earnings,
        roomTotal: earnings,
        cleaningFee: 0,
        guestServiceFee: 0,
        hostServiceFee: 0,
        status: 'CONFIRMED',
        importSource: 'API_WEBHOOK',
      },
    })

    return created.id
  } catch (error) {
    console.error('Error creating gestion reservation:', error)
    return undefined
  }
}

/**
 * Send guidebook email to guest and create GuidebookDelivery record
 */
async function sendGuidebookToGuest(params: {
  propertyId: string
  email: string
  name: string
  language: string
  reservationId?: string
  slug: string | null
  propertyName: string
  userId: string
}) {
  const { propertyId, email, name, language, reservationId, slug, propertyName, userId } = params

  // Anti-duplicate: don't send if already delivered to same email+property in last 7 days
  const recentDelivery = await prisma.guidebookDelivery.findFirst({
    where: {
      propertyId,
      guestEmail: email,
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
  })

  if (recentDelivery) {
    console.log(`Skipping duplicate guidebook delivery to ${email} for property ${propertyId}`)
    return
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.itineramio.com'
  const guideUrl = slug ? `${baseUrl}/guide/${slug}` : `${baseUrl}/guide/${propertyId}`

  // Get host name for email
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  })

  const lang = (language === 'en' || language === 'fr') ? language : 'es'
  const subject = getDeliverySubject(propertyName, lang)

  const result = await sendEmail({
    to: email,
    subject,
    react: React.createElement(GuidebookDeliveryEmail, {
      guestName: name,
      propertyName,
      guideUrl,
      hostName: user?.name || 'Tu anfitrión',
      language: lang as 'es' | 'en' | 'fr',
    }),
    tags: ['guidebook-delivery', propertyId],
  })

  const resendEmailId = result.success && result.data ? (result.data as any).id : null

  await prisma.guidebookDelivery.create({
    data: {
      propertyId,
      reservationId,
      guestEmail: email,
      guestName: name,
      language: lang,
      guideUrl,
      sentAt: result.success ? new Date() : null,
      resendEmailId,
      source: 'API',
    },
  })
}
