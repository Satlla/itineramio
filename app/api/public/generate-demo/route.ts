import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { checkRateLimit, getRateLimitKey } from '../../../../src/lib/rate-limit'
import { generateSlug } from '../../../../src/lib/slug-utils'
import { generatePropertyNumber, extractNumberFromReference } from '../../../../src/lib/property-number-generator'
import { fetchAllLocationData } from '../../../../src/lib/ai-setup/places'
import { validateEmail } from '../../../../src/utils/email-validation'
import { verifyDemoVerificationToken } from '../../../../src/lib/demo-otp'
import { sendEmail, emailTemplates } from '../../../../src/lib/email'
import {
  type PropertyInput,
  type TrilingualZoneConfig,
  buildCheckInZone,
  buildCheckOutZone,
  buildWifiZone,
  buildHouseRulesZone,
  buildRecyclingZone,
  buildEmergencyZone,
  buildSingleApplianceZone,
} from '../../../../src/lib/ai-setup/zone-builders'
import { APPLIANCE_REGISTRY, type CanonicalApplianceType } from '../../../../src/lib/ai-setup/zone-registry'
import { buildCityInfoZone } from '../../../../src/lib/ai-setup/city-links-builder'

// ============================================
// Turnstile verification
// ============================================

async function verifyTurnstile(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY
  if (!secretKey) {
    // If Turnstile secret is not configured, skip verification gracefully.
    // The demo flow already has rate limiting (IP + email), OTP verification,
    // and disposable email blocking as anti-abuse measures.
    return true
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    })
    const data = await response.json()
    return data.success === true
  } catch {
    return false
  }
}

// ============================================
// Demo cleanup: delete expired demo properties
// ============================================

async function cleanupExpiredDemos() {
  try {
    // Only cleanup properties expired more than 48h ago (safety margin for registration flow)
    const safeCleanupThreshold = new Date(Date.now() - 48 * 60 * 60 * 1000)
    const expired = await prisma.property.findMany({
      where: {
        isDemoPreview: true,
        demoExpiresAt: { lt: safeCleanupThreshold },
      },
      select: { id: true },
    })

    if (expired.length === 0) return

    const propertyIds = expired.map(p => p.id)

    // Delete in order: steps → recommendations → zones → analytics → property
    await prisma.step.deleteMany({
      where: { zones: { propertyId: { in: propertyIds } } },
    })
    await prisma.recommendation.deleteMany({
      where: { zone: { propertyId: { in: propertyIds } } },
    })
    await prisma.zone.deleteMany({
      where: { propertyId: { in: propertyIds } },
    })
    await prisma.propertyAnalytics.deleteMany({
      where: { propertyId: { in: propertyIds } },
    })
    await prisma.property.deleteMany({
      where: { id: { in: propertyIds } },
    })

  } catch {
    // non-blocking cleanup error ignored
  }
}

// ============================================
// Get or create demo system user
// ============================================

const DEMO_SYSTEM_EMAIL = 'system-demo@itineramio.com'

async function getDemoSystemUser(): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { email: DEMO_SYSTEM_EMAIL },
    select: { id: true },
  })
  if (existing) return existing.id

  const user = await prisma.user.create({
    data: {
      email: DEMO_SYSTEM_EMAIL,
      name: 'Demo System',
      role: 'HOST',
      status: 'ACTIVE',
      isActive: true,
    },
  })
  return user.id
}

// ============================================
// Generate coupon code
// ============================================

function generateCouponCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'DEMO-'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// ============================================
// POST handler
// ============================================

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limit: 3 demos per IP per 24h
    const rateLimitKey = getRateLimitKey(request, null, 'demo')
    const rateCheck = checkRateLimit(rateLimitKey, {
      maxRequests: 3,
      windowMs: 24 * 60 * 60 * 1000,
    })
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Has alcanzado el límite de demos por hoy. Vuelve mañana.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    // 2. Validate Turnstile (if configured)
    const turnstileConfigured = !!process.env.TURNSTILE_SECRET_KEY
    if (!body.turnstileToken) {
      if (turnstileConfigured) {
        return NextResponse.json(
          { error: 'Verificación de seguridad requerida. Completa el captcha.' },
          { status: 403 }
        )
      }
    } else {
      const isValid = await verifyTurnstile(body.turnstileToken)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Verificación de seguridad fallida. Recarga la página.' },
          { status: 403 }
        )
      }
    }

    // 3. Validate required fields
    const {
      // Lead data
      leadName, leadEmail, leadPhone,
      // Email verification token (from OTP flow)
      emailVerificationToken,
      // Property data
      propertyName, street, city, state, country, postalCode, lat, lng,
      propertyType, bedrooms, bathrooms, maxGuests,
      wifiName, wifiPassword,
      checkInTime, checkInMethod, checkOutTime,
      hasParking, hasAC,
      hostContactName, hostContactPhone, hostContactEmail,
      // Extended fields from full wizard (optional)
      mediaAnalysis,
      disabledZones: disabledZoneIds,
      reviewedContent,
      customTitles,
      customIcons,
    } = body

    if (!leadName || !leadEmail || !leadPhone || !propertyName || !street || !city || !lat || !lng) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios.' },
        { status: 400 }
      )
    }

    // 3b. Validate email (format + disposable + suspicious)
    const emailValidation = validateEmail(leadEmail)
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error || 'Email no válido.' },
        { status: 400 }
      )
    }

    // 3c. Rate limit by email: max 2 demos per email per 24h
    const normalizedEmail = leadEmail.toLowerCase().trim()
    const emailRateLimitKey = `demo:email:${normalizedEmail}`
    const emailRateCheck = checkRateLimit(emailRateLimitKey, {
      maxRequests: 2,
      windowMs: 24 * 60 * 60 * 1000,
    })
    if (!emailRateCheck.allowed) {
      return NextResponse.json(
        { error: 'Ya has generado el máximo de demos con este email. Vuelve mañana.' },
        { status: 429 }
      )
    }

    // 3d. Validate email verification token (OTP flow)
    if (!emailVerificationToken) {
      // Allow bypass only in development
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Verificación de email requerida.' },
          { status: 403 }
        )
      }
      // emailVerificationToken not provided, skipping (dev mode)
    } else {
      const isTokenValid = verifyDemoVerificationToken(emailVerificationToken, normalizedEmail)
      if (!isTokenValid) {
        return NextResponse.json(
          { error: 'Token de verificación inválido o expirado. Vuelve a verificar tu email.' },
          { status: 403 }
        )
      }
    }

    // 4. Cleanup expired demos (opportunistic)
    cleanupExpiredDemos().catch(() => {})

    // 5. Create Lead
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwarded?.split(',')[0]?.trim() || realIp || undefined

    const lead = await prisma.lead.create({
      data: {
        name: leadName,
        email: leadEmail,
        source: 'demo',
        ipAddress,
        userAgent: request.headers.get('user-agent') || undefined,
        metadata: {
          phone: leadPhone || '',
          propertyName,
          city,
          country: country || 'España',
          generatedAt: new Date().toISOString(),
          demoGeneratedAt: new Date().toISOString(),
          couponCode: '', // Will be updated after coupon creation
          propertyId: '', // Will be updated after property creation
          feedbackEmailSentAt: null,
          urgencyEmailSentAt: null,
        },
      },
    })

    // 5b. Cleanup OTPs for this email (non-blocking)
    prisma.demoOtp.deleteMany({ where: { email: normalizedEmail } }).catch(() => {})

    // 6. Create personalized Coupon
    const now = new Date()
    const couponCode = generateCouponCode()
    await prisma.coupon.create({
      data: {
        code: couponCode,
        name: `Demo 20% - ${leadName}`,
        type: 'percentage',
        discountPercent: 20,
        maxUses: 1,
        maxUsesPerUser: 1,
        validFrom: now,
        validUntil: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours
        campaignSource: 'demo-preview',
        isActive: true,
        isPublic: false,
        applicableToPlans: [],
      },
    })

    // 7. Get/create demo system user
    const demoUserId = await getDemoSystemUser()

    // 8. Build property input
    const propertyInput: PropertyInput = {
      name: propertyName,
      description: `Demo property: ${propertyName}`,
      type: propertyType || 'APARTMENT',
      street,
      city,
      state: state || '',
      country: country || 'España',
      postalCode: postalCode || '',
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      bedrooms: parseInt(bedrooms) || 1,
      bathrooms: parseInt(bathrooms) || 1,
      maxGuests: parseInt(maxGuests) || 3,
      wifiName: wifiName || '',
      wifiPassword: wifiPassword || '',
      checkInTime: checkInTime || '15:00',
      checkInMethod: checkInMethod || 'lockbox',
      checkOutTime: checkOutTime || '11:00',
      hasParking: hasParking || 'no',
      hasAC: !!hasAC,
      hostContactName: hostContactName || leadName,
      hostContactPhone: hostContactPhone || leadPhone || '',
      hostContactEmail: hostContactEmail || leadEmail,
      details: body.intelligence?.details,
    }

    // 9. Build essential zones (free, template-based)
    const allZones: TrilingualZoneConfig[] = []

    allZones.push(buildCheckInZone(propertyInput))
    allZones.push(buildCheckOutZone(propertyInput))

    const wifiZone = buildWifiZone(propertyInput)
    if (wifiZone) allZones.push(wifiZone)

    allZones.push(buildHouseRulesZone(propertyInput))
    allZones.push(buildRecyclingZone(propertyInput))
    allZones.push(buildEmergencyZone(propertyInput, []))

    // AC zone if applicable
    if (propertyInput.hasAC) {
      const acZone = buildSingleApplianceZone('air_conditioning', APPLIANCE_REGISTRY.air_conditioning)
      if (acZone) allZones.push(acZone)
    }

    // 9b. Build user media zones (simple version for demo — no AI improvement)
    if (Array.isArray(mediaAnalysis) && mediaAnalysis.length > 0) {
      // Group media by zone (skip built-in zones: checkin, garage, ac)
      const BUILTIN_ZONE_IDS = new Set(['checkin', 'garage', 'ac'])
      const zoneGroups = new Map<string, { name: string; description: string; mediaItems: { url: string; type: string }[] }>()

      for (const item of mediaAnalysis) {
        const zoneId = item.zoneId
        if (!zoneId && !item.customZoneName) continue
        if (zoneId && BUILTIN_ZONE_IDS.has(zoneId)) continue

        const key = item.customZoneName ? `custom-${item.customZoneName}` : zoneId
        if (!key) continue

        if (!zoneGroups.has(key)) {
          const PREDEFINED: Record<string, string> = {
            kitchen: 'Cocina', bathroom: 'Baño', bedroom: 'Dormitorio principal',
            bedroom2: 'Dormitorio 2', living: 'Salón', terrace: 'Terraza / Jardín',
            pool: 'Piscina', laundry: 'Lavadora / Lavandería', tv: 'TV / Entretenimiento',
          }
          zoneGroups.set(key, {
            name: item.customZoneName || PREDEFINED[zoneId!] || zoneId!,
            description: '',
            mediaItems: [],
          })
        }
        const group = zoneGroups.get(key)!
        if (item.description) group.description += (group.description ? '\n' : '') + item.description
        if (item.url) group.mediaItems.push({ url: item.url, type: item.type || 'image' })
      }

      for (const [, data] of zoneGroups) {
        const steps: TrilingualZoneConfig['steps'] = []

        // Add description step if there's text content
        if (data.description) {
          steps.push({
            type: 'text',
            title: { es: data.name, en: data.name, fr: data.name },
            content: {
              es: data.description,
              en: data.description,
              fr: data.description,
            },
          })
        }

        // Add media steps for each uploaded file (use item.type from MediaItem)
        for (const mediaItem of data.mediaItems) {
          steps.push({
            type: mediaItem.type === 'video' ? 'VIDEO' : 'IMAGE',
            title: { es: data.name, en: data.name, fr: data.name },
            content: {
              es: '',
              en: '',
              fr: '',
              mediaUrl: mediaItem.url,
            } as any,
          })
        }

        // Fallback: if no steps at all, add a text placeholder
        if (steps.length === 0) {
          steps.push({
            type: 'text',
            title: { es: data.name, en: data.name, fr: data.name },
            content: {
              es: `Zona: ${data.name}`,
              en: `Zone: ${data.name}`,
              fr: `Zone : ${data.name}`,
            },
          })
        }

        const zone: TrilingualZoneConfig = {
          name: { es: data.name, en: data.name, fr: data.name },
          icon: 'zap',
          description: { es: data.description || data.name, en: data.description || data.name, fr: data.description || data.name },
          steps,
          needsTranslation: true,
        }
        allZones.push(zone)
      }
    }

    // 10. Fetch location data in parallel
    let locationData: Awaited<ReturnType<typeof fetchAllLocationData>> | null = null
    try {
      locationData = await fetchAllLocationData(
        propertyInput.lat,
        propertyInput.lng,
        propertyInput.city,
      )
    } catch {
      // non-blocking location data fetch error ignored
    }

    // 11. Build location zones (directions)
    if (locationData) {
      const dirSteps: TrilingualZoneConfig['steps'] = []
      const address = `${propertyInput.street}, ${propertyInput.postalCode} ${propertyInput.city}`
      const mapsLink = `https://www.google.com/maps/search/?api=1&query=${propertyInput.lat},${propertyInput.lng}`

      const airportD = locationData.directions.drivingFromAirport
      if (airportD) {
        dirSteps.push({
          type: 'text',
          title: { es: 'Desde el aeropuerto', en: 'From the airport', fr: "Depuis l'aéroport" },
          content: {
            es: `✈️ **Aeropuerto de ${propertyInput.city}**\n\n🚕 **Taxi:**\n• Duración: ~${airportD.duration}\n• Distancia: ${airportD.distance}\n• Dile al taxista: "${address}"\n\n📱 **Apps recomendadas:** Uber, Cabify, FreeNow`,
            en: `✈️ **${propertyInput.city} Airport**\n\n🚕 **Taxi:**\n• Duration: ~${airportD.duration}\n• Distance: ${airportD.distance}\n• Tell the driver: "${address}"\n\n📱 **Recommended apps:** Uber, Cabify, FreeNow`,
            fr: `✈️ **Aéroport de ${propertyInput.city}**\n\n🚕 **Taxi:**\n• Durée: ~${airportD.duration}\n• Distance: ${airportD.distance}\n• Dites au chauffeur: "${address}"\n\n📱 **Apps recommandées:** Uber, Cabify, FreeNow`,
          },
        })
      }

      const trainD = locationData.directions.drivingFromTrainStation
      if (trainD) {
        dirSteps.push({
          type: 'text',
          title: { es: 'Desde la estación de tren', en: 'From the train station', fr: 'Depuis la gare' },
          content: {
            es: `🚂 **Estación de tren de ${propertyInput.city}**\n\n🚕 **Taxi:** ~${trainD.duration}, ${trainD.distance}`,
            en: `🚂 **${propertyInput.city} train station**\n\n🚕 **Taxi:** ~${trainD.duration}, ${trainD.distance}`,
            fr: `🚂 **Gare de ${propertyInput.city}**\n\n🚕 **Taxi:** ~${trainD.duration}, ${trainD.distance}`,
          },
        })
      }

      const busD = locationData.directions.drivingFromBusStation
      if (busD) {
        dirSteps.push({
          type: 'text',
          title: { es: 'Desde la estación de autobuses', en: 'From the bus station', fr: 'Depuis la gare routière' },
          content: {
            es: `🚌 **Estación de autobuses de ${propertyInput.city}**\n\n🚕 **Taxi:** ~${busD.duration}, ${busD.distance}`,
            en: `🚌 **${propertyInput.city} bus station**\n\n🚕 **Taxi:** ~${busD.duration}, ${busD.distance}`,
            fr: `🚌 **Gare routière de ${propertyInput.city}**\n\n🚕 **Taxi:** ~${busD.duration}, ${busD.distance}`,
          },
        })
      }

      const parkingNote = propertyInput.hasParking === 'yes'
        ? 'Dispone de parking privado / Has private parking / Parking privé'
        : 'No incluido / Not included / Non inclus'
      dirSteps.push({
        type: 'text',
        title: { es: 'En coche', en: 'By car', fr: 'En voiture' },
        content: {
          es: `🚗 **Dirección GPS:** ${address}\n\n📍 **Google Maps:** ${mapsLink}\n📍 **Waze:** https://waze.com/ul?ll=${propertyInput.lat},${propertyInput.lng}&navigate=yes\n\n🅿️ **Parking:** ${parkingNote.split(' / ')[0]}`,
          en: `🚗 **GPS Address:** ${address}\n\n📍 **Google Maps:** ${mapsLink}\n📍 **Waze:** https://waze.com/ul?ll=${propertyInput.lat},${propertyInput.lng}&navigate=yes\n\n🅿️ **Parking:** ${parkingNote.split(' / ')[1]}`,
          fr: `🚗 **Adresse GPS:** ${address}\n\n📍 **Google Maps:** ${mapsLink}\n📍 **Waze:** https://waze.com/ul?ll=${propertyInput.lat},${propertyInput.lng}&navigate=yes\n\n🅿️ **Parking:** ${parkingNote.split(' / ')[2]}`,
        },
      })

      if (dirSteps.length > 0) {
        allZones.push({
          name: { es: 'Cómo Llegar', en: 'How to Get Here', fr: 'Comment Arriver' },
          icon: 'map-pin',
          description: {
            es: 'Direcciones desde aeropuerto, tren, autobús y ubicación exacta',
            en: 'Directions from airport, train, bus and exact location',
            fr: "Directions depuis l'aéroport, gare, bus et localisation exacte",
          },
          steps: dirSteps,
          needsTranslation: false,
        })
      }
    }

    // 11b. City info zone (tourist map, transport, emergency numbers)
    allZones.push(buildCityInfoZone(
      propertyInput.city,
      propertyInput.lat,
      propertyInput.lng,
      propertyInput.country,
    ))

    // 11c. Filter disabled zones and apply customizations
    const disabledSet = new Set<string>(Array.isArray(disabledZoneIds) ? disabledZoneIds : [])
    const reviewedContentMap: Record<string, string> = reviewedContent || {}
    const customTitlesMap: Record<string, string> = customTitles || {}
    const customIconsMap: Record<string, string> = customIcons || {}

    const filteredZones = allZones.filter(zone => {
      // Build a zone ID matching the client-side convention (lowercase, dashes)
      const zoneId = zone.name.es.toLowerCase().replace(/\s+/g, '-')
      return !disabledSet.has(zoneId)
    })

    // Apply custom titles, icons, and reviewed content
    for (const zone of filteredZones) {
      const zoneId = zone.name.es.toLowerCase().replace(/\s+/g, '-')

      if (customTitlesMap[zoneId]) {
        zone.name.es = customTitlesMap[zoneId]
      }
      if (customIconsMap[zoneId]) {
        zone.icon = customIconsMap[zoneId]
      }
      // Apply reviewed content to the first step's Spanish content
      if (reviewedContentMap[zoneId] && zone.steps.length > 0) {
        zone.steps[0].content.es = reviewedContentMap[zoneId]
      }
    }

    // 12. Create Property in DB
    const baseSlug = generateSlug(propertyInput.name)
    const uniqueSlug = `demo-${baseSlug}-${Date.now().toString(36)}`

    // Get next property code
    const allProperties = await prisma.property.findMany({
      where: { propertyCode: { not: null, startsWith: 'ITN-' } },
      select: { propertyCode: true },
      orderBy: { propertyCode: 'desc' },
      take: 1,
    })
    let highestNumber = 0
    if (allProperties.length > 0 && allProperties[0].propertyCode) {
      highestNumber = extractNumberFromReference(allProperties[0].propertyCode) || 0
    }
    const propertyCode = generatePropertyNumber(highestNumber)

    const demoExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24h real lifetime
    const demoVisualExpiresAt = new Date(now.getTime() + 15 * 60 * 1000) // 15 min visual countdown

    const property = await prisma.property.create({
      data: {
        name: propertyInput.name,
        slug: uniqueSlug,
        propertyCode,
        description: propertyInput.description,
        type: propertyInput.type,
        street: propertyInput.street,
        city: propertyInput.city,
        state: propertyInput.state,
        country: propertyInput.country,
        postalCode: propertyInput.postalCode,
        bedrooms: propertyInput.bedrooms,
        bathrooms: propertyInput.bathrooms,
        maxGuests: propertyInput.maxGuests,
        hostContactName: propertyInput.hostContactName,
        hostContactPhone: propertyInput.hostContactPhone,
        hostContactEmail: propertyInput.hostContactEmail,
        status: 'DRAFT',
        isPublished: false,
        isDemoPreview: true,
        demoExpiresAt,
        demoLeadId: lead.id,
        hostId: demoUserId,
        intelligence: body.intelligence || null,
        analytics: { create: {} },
      },
    })

    // 12b. Update Lead metadata with couponCode and propertyId
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        metadata: {
          ...(lead.metadata as Record<string, unknown>),
          couponCode,
          propertyId: property.id,
          propertyName: propertyInput.name,
        },
      },
    })

    // 13. Create Zones + Steps in DB
    let order = 0
    for (const zoneConfig of filteredZones) {
      if (zoneConfig.steps.length === 0) continue

      const timestamp = Date.now() + order
      const random1 = Math.random().toString(36).substr(2, 12)
      const random2 = Math.random().toString(36).substr(2, 12)
      const zoneSlug = `${generateSlug(zoneConfig.name.es)}-${timestamp}`

      const zone = await prisma.zone.create({
        data: {
          propertyId: property.id,
          name: {
            es: zoneConfig.name.es,
            en: zoneConfig.name.en || zoneConfig.name.es,
            fr: zoneConfig.name.fr || zoneConfig.name.es,
          },
          slug: zoneSlug,
          description: {
            es: zoneConfig.description.es,
            en: zoneConfig.description.en || zoneConfig.description.es,
            fr: zoneConfig.description.fr || zoneConfig.description.es,
          },
          icon: zoneConfig.icon,
          color: 'bg-gray-100',
          status: 'ACTIVE',
          isPublished: true,
          order: order++,
          qrCode: `qr_${timestamp}_${random1}`,
          accessCode: `ac_${timestamp}_${random2}`,
        },
      })

      await prisma.step.createMany({
        data: zoneConfig.steps.map((stepConfig, idx) => {
          const contentObj: Record<string, any> = {
            es: stepConfig.content.es,
            en: stepConfig.content.en || stepConfig.content.es,
            fr: stepConfig.content.fr || stepConfig.content.es,
          }
          // Preserve mediaUrl for image/video steps
          if ((stepConfig.content as any).mediaUrl) {
            contentObj.mediaUrl = (stepConfig.content as any).mediaUrl
          }
          return {
            zoneId: zone.id,
            type: stepConfig.type || 'text',
            title: {
              es: stepConfig.title.es,
              en: stepConfig.title.en || stepConfig.title.es,
              fr: stepConfig.title.fr || stepConfig.title.es,
            },
            content: contentObj,
            isPublished: true,
            order: idx,
          }
        }),
      })
    }

    // 15. Send confirmation email (non-blocking)
    const couponExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.itineramio.com'
    const guideUrl = `${baseUrl}/guide/${property.id}?demo=1&coupon=${couponCode}&expires=${encodeURIComponent(demoVisualExpiresAt.toISOString())}`
    try {
      await sendEmail({
        to: leadEmail,
        subject: `Tu demo de ${propertyInput.name} esta lista`,
        html: emailTemplates.demoConfirmation({
          leadName: leadName,
          propertyName: propertyInput.name,
          guideUrl,
          couponCode,
          couponExpiresAt: couponExpiresAt.toLocaleString('es-ES', {
            timeZone: 'Europe/Madrid',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          propertyId: property.id,
          leadEmail,
          zonesCount: filteredZones.length,
        }),
      })
    } catch {
      // non-blocking email error ignored
    }

    // 16. Return response
    return NextResponse.json({
      success: true,
      propertyId: property.id,
      couponCode,
      expiresAt: demoVisualExpiresAt.toISOString(),
      couponExpiresAt: couponExpiresAt.toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Error al generar el demo. Inténtalo de nuevo.', details: message },
      { status: 500 }
    )
  }
}
