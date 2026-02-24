import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { checkRateLimit, getRateLimitKey } from '../../../../src/lib/rate-limit'
import { generateSlug } from '../../../../src/lib/slug-utils'
import { generatePropertyNumber, extractNumberFromReference } from '../../../../src/lib/property-number-generator'
import { fetchAllLocationData } from '../../../../src/lib/ai-setup/places'
import { generateRecommendations } from '../../../../src/lib/recommendations'
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

// ============================================
// Turnstile verification
// ============================================

async function verifyTurnstile(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY
  if (!secretKey) {
    console.warn('[demo] TURNSTILE_SECRET_KEY not configured, skipping verification')
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
  } catch (error) {
    console.error('[demo] Turnstile verification error:', error)
    return false
  }
}

// ============================================
// Demo cleanup: delete expired demo properties
// ============================================

async function cleanupExpiredDemos() {
  try {
    const expired = await prisma.property.findMany({
      where: {
        isDemoPreview: true,
        demoExpiresAt: { lt: new Date() },
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

    console.log(`[demo] Cleaned up ${expired.length} expired demo properties`)
  } catch (err) {
    console.error('[demo] Cleanup error (non-blocking):', err)
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

    // 2. Validate Turnstile
    if (body.turnstileToken) {
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

    if (!leadName || !leadEmail || !propertyName || !street || !city || !lat || !lng) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios.' },
        { status: 400 }
      )
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
        },
      },
    })

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
        validUntil: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour
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

    // 9b. Build appliance zones from media analysis (if provided)
    if (Array.isArray(mediaAnalysis) && mediaAnalysis.length > 0) {
      const BUILTIN_CATEGORIES = new Set(['entrance', 'check_out', 'wifi', 'parking', 'ac'])
      const processedTypes = new Set<string>()

      for (const item of mediaAnalysis) {
        const analysis = item.analysis
        if (!analysis) continue
        // Skip media assigned to built-in zones
        if (item.category && BUILTIN_CATEGORIES.has(item.category)) continue

        // Check primary_item first
        if (analysis.primary_item) {
          const type = analysis.primary_item as CanonicalApplianceType
          if (!processedTypes.has(type) && APPLIANCE_REGISTRY[type]) {
            processedTypes.add(type)
            const zone = buildSingleApplianceZone(type, APPLIANCE_REGISTRY[type])
            if (zone) allZones.push(zone)
          }
        }

        // Then iterate all detected appliances
        if (Array.isArray(analysis.appliances)) {
          for (const appliance of analysis.appliances) {
            const type = appliance.canonical_type as CanonicalApplianceType
            if (processedTypes.has(type)) continue
            if (!APPLIANCE_REGISTRY[type]) continue
            processedTypes.add(type)
            const zone = buildSingleApplianceZone(type, APPLIANCE_REGISTRY[type])
            if (zone) allZones.push(zone)
          }
        }
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
    } catch (err) {
      console.error('[demo] Location data fetch failed (non-blocking):', err)
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

    // 11b. Filter disabled zones and apply customizations
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

    const demoExpiresAt = new Date(now.getTime() + 15 * 60 * 1000) // 15 min buffer

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
        analytics: { create: {} },
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
        data: zoneConfig.steps.map((stepConfig, idx) => ({
          zoneId: zone.id,
          type: stepConfig.type || 'text',
          title: {
            es: stepConfig.title.es,
            en: stepConfig.title.en || stepConfig.title.es,
            fr: stepConfig.title.fr || stepConfig.title.es,
          },
          content: {
            es: stepConfig.content.es,
            en: stepConfig.content.en || stepConfig.content.es,
            fr: stepConfig.content.fr || stepConfig.content.es,
          },
          isPublished: true,
          order: idx,
        })),
      })
    }

    // 14. Generate nearby recommendations (async, non-blocking for response)
    // We still await it because the demo preview needs them
    if (propertyInput.lat && propertyInput.lng) {
      try {
        await generateRecommendations(
          property.id,
          propertyInput.lat,
          propertyInput.lng,
          undefined,
          propertyInput.city,
        )
      } catch (err) {
        console.error('[demo] Recommendation generation failed (non-blocking):', err)
      }
    }

    // 15. Return response
    return NextResponse.json({
      success: true,
      propertyId: property.id,
      couponCode,
      expiresAt: demoExpiresAt.toISOString(),
      couponExpiresAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    })
  } catch (error) {
    console.error('[demo] Generation error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Error al generar el demo. Inténtalo de nuevo.', details: message },
      { status: 500 }
    )
  }
}
