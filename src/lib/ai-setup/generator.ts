/**
 * Manual generation orchestrator for AI Setup wizard.
 *
 * Template-first approach:
 * 1. Essential zones (check-in, check-out, wifi, house-rules, emergency, recycling)
 *    → use professional pre-built templates from zone-content-templates.ts (already trilingual)
 * 2. Appliance zones (one per detected appliance)
 *    → template if available, otherwise generateBasicApplianceContent (already trilingual)
 * 3. Location zones (directions, supermarkets, restaurants, etc.)
 *    → dynamic from Google Places (ES only, translated via Claude Haiku)
 *
 * Result: drastically less AI usage, more professional content, faster generation.
 */

import { prisma } from '../prisma'
import { generateSlug } from '../slug-utils'
import { generatePropertyNumber, extractNumberFromReference } from '../property-number-generator'
import { translateFields } from '../translate'
import { generateZoneQRCode } from '../qr'
import { fetchAllLocationData } from './places'
import { generateRecommendations } from '../recommendations'
import { type MediaAnalysisResult, type DetectedAppliance } from './vision'
import { getZoneContentTemplate, type ZoneContentTemplate } from '../../data/zone-content-templates'
import {
  APPLIANCE_REGISTRY,
  generateBasicApplianceContent,
  getEmergencyNumbers,
  resolveCountryCode,
  normalizeAppliance,
  type CanonicalApplianceType,
} from './zone-registry'
import {
  type PropertyDetails,
  type PropertyInput,
  type TrilingualZoneConfig,
  replaceVariables,
  applyPlaceholderDefaults,
  cleanUnfilledPlaceholders,
  templateToZoneConfig,
  buildCheckInZone,
  buildFallbackCheckIn,
  buildCheckOutZone,
  buildWifiZone,
  buildHouseRulesZone,
  buildRecyclingZone,
  buildEmergencyZone,
  buildEmergencyContent,
  buildSingleApplianceZone,
} from './zone-builders'

// Re-export types so existing consumers still work
export type { PropertyDetails, PropertyInput, TrilingualZoneConfig }

export interface GenerationEvent {
  type: 'status' | 'zone' | 'translation' | 'complete' | 'error'
  message?: string
  zone?: { name: string; icon: string; description: string; stepsCount: number }
  language?: string
  progress?: number
  stats?: { zones: number; steps: number; languages: number; time: number }
  error?: string
}

type SendEvent = (event: GenerationEvent) => void

// Helpers (replaceVariables, applyPlaceholderDefaults, cleanUnfilledPlaceholders, templateToZoneConfig)
// are now in zone-builders.ts

/**
 * Assign uploaded media (images/videos) to the matching zone steps.
 * Matches by room_type or appliance canonical_type → zone name.
 */
async function assignMediaToSteps(
  propertyId: string,
  mediaItems: any[],
  zoneConfigs: TrilingualZoneConfig[],
): Promise<void> {
  // Build a map: zone name (ES lowercase) → appliance types that belong to it
  const zoneNameToAppliances = new Map<string, Set<string>>()
  for (const [type, entry] of Object.entries(APPLIANCE_REGISTRY)) {
    const nameEs = entry.nameEs.toLowerCase()
    const existing = zoneNameToAppliances.get(nameEs) || new Set()
    existing.add(type)
    zoneNameToAppliances.set(nameEs, existing)
  }

  // Room type → zone name mapping
  const roomTypeToZoneName: Record<string, string> = {
    kitchen: 'cocina',
    bathroom: 'baño',
    bedroom: 'dormitorio',
    living_room: 'salón',
    laundry: 'lavadora',
    entrance: 'check in',
    terrace: 'terraza',
    garden: 'jardín',
    pool: 'piscina',
    garage: 'parking',
    parking: 'parking',
  }

  // Get all zones with their first step from DB
  const dbZones = await prisma.zone.findMany({
    where: { propertyId },
    include: { steps: { orderBy: { order: 'asc' }, take: 1 } },
    orderBy: { order: 'asc' },
  })

  // User-assigned category → zone name (ES) mapping
  const categoryToZoneNameEs: Record<string, string> = {
    entrance: 'check in',
    check_out: 'check out',
    wifi: 'wifi',
    kitchen: 'cocina',
    bathroom: 'baño',
    bedroom: 'dormitorio',
    living_room: 'salón',
    parking: 'parking',
    ac: 'aire acondicionado',
    terrace: 'terraza',
    pool: 'piscina',
    tv: 'televisión',
    washing_machine: 'lavadora',
    dishwasher: 'lavavajillas',
    microwave: 'microondas',
    coffee: 'cafetera',
  }

  // Track which zones already got a media item (max 1 per zone)
  const assignedZoneIds = new Set<string>()

  for (const mediaItem of mediaItems) {
    if (!mediaItem.url) continue
    const analysis = mediaItem.analysis || mediaItem
    const category = mediaItem.category as string | undefined

    // Skip if no useful data at all
    if (!category && !analysis.room_type && !analysis.appliances?.length) continue

    const mediaType = mediaItem.type === 'video' ? 'VIDEO' : 'IMAGE'
    const mediaUrl = mediaItem.url
    const caption = (mediaItem.caption || '').trim()

    // Helper to update a step with media + optional caption
    const assignToStep = async (step: any, dbZone: any) => {
      const existingContent = (step.content as any) || {}
      const updatedContent: any = { ...existingContent, mediaUrl }
      // If the user wrote a caption, append it to the ES content
      if (caption) {
        const existingEs = existingContent.es || ''
        updatedContent.es = existingEs ? `${existingEs}\n\n${caption}` : caption
      }
      await prisma.step.update({
        where: { id: step.id },
        data: { type: mediaType, content: updatedContent },
      })
      assignedZoneIds.add(dbZone.id)
    }

    // Priority 1: user-assigned category
    let matched = false
    if (category) {
      const targetName = categoryToZoneNameEs[category]
      if (targetName) {
        const dbZone = dbZones.find(z => {
          if (assignedZoneIds.has(z.id)) return false
          const name = typeof z.name === 'object' ? (z.name as any).es : z.name
          return name?.toLowerCase().includes(targetName)
        })
        if (dbZone && dbZone.steps.length > 0) {
          await assignToStep(dbZone.steps[0], dbZone)
          matched = true
          console.log(`[generator] Assigned ${mediaType} to zone "${(dbZone.name as any)?.es}" via category "${category}"`)
        }
      }
    }

    if (matched) continue

    // Priority 2: match by appliance (more specific than room_type)
    if (analysis.appliances?.length) {
      for (const appliance of analysis.appliances) {
        const canonicalType = appliance.canonical_type
        // Find which zone name this appliance belongs to
        for (const [zoneNameLower, types] of zoneNameToAppliances.entries()) {
          if (types.has(canonicalType)) {
            // Find the DB zone with this name
            const dbZone = dbZones.find(z => {
              if (assignedZoneIds.has(z.id)) return false
              const name = typeof z.name === 'object' ? (z.name as any).es : z.name
              return name?.toLowerCase().includes(zoneNameLower)
            })
            if (dbZone && dbZone.steps.length > 0) {
              await assignToStep(dbZone.steps[0], dbZone)
              matched = true
              console.log(`[generator] Assigned ${mediaType} to zone "${(dbZone.name as any)?.es}" step "${(dbZone.steps[0].title as any)?.es}"`)
              break
            }
          }
        }
        if (matched) break
      }
    }

    // Priority 3: match by room_type
    if (!matched && analysis.room_type) {
      const targetName = roomTypeToZoneName[analysis.room_type]
      if (targetName) {
        const dbZone = dbZones.find(z => {
          if (assignedZoneIds.has(z.id)) return false
          const name = typeof z.name === 'object' ? (z.name as any).es : z.name
          return name?.toLowerCase().includes(targetName)
        })
        if (dbZone && dbZone.steps.length > 0) {
          await assignToStep(dbZone.steps[0], dbZone)
          console.log(`[generator] Assigned ${mediaType} to zone "${(dbZone.name as any)?.es}" via room_type "${analysis.room_type}"`)
        }
      }
    }
  }
}

/**
 * Categories that map to built-in zones (check-in, check-out, wifi, etc.)
 * Media assigned to these should NOT also create appliance zones.
 */
const BUILTIN_USER_CATEGORIES = new Set(['entrance', 'check_out', 'wifi', 'parking', 'ac'])

/**
 * Normalize media analysis to new format (handles old {zone, items[]} format).
 * Preserves user-assigned category so buildApplianceZones can skip built-in media.
 */
function normalizeMediaInput(raw: any): MediaAnalysisResult {
  // MediaItem objects from the wizard have analysis nested inside
  const data = raw.analysis || raw
  const userCategory = raw.category as string | undefined

  if (data.zone && !data.room_type) {
    return {
      room_type: data.zone,
      appliances: (data.items || []).map((item: string) => ({
        detected_label: item,
        canonical_type: normalizeAppliance(item) || item,
        confidence: data.confidence || 0.8,
      })),
      description: data.description || '',
      confidence: data.confidence || 0.8,
      userCategory,
    }
  }
  return { ...data, userCategory } as MediaAnalysisResult
}

// Essential zone builders (buildCheckInZone, buildCheckOutZone, buildWifiZone, etc.)
// are now in zone-builders.ts

// ============================================
// APPLIANCE ZONE BUILDERS (one zone per appliance)
// ============================================

function buildApplianceZones(mediaAnalysis: MediaAnalysisResult[]): TrilingualZoneConfig[] {
  const zones: TrilingualZoneConfig[] = []
  const processedTypes = new Set<string>()

  for (const analysis of mediaAnalysis) {
    // Skip media assigned to built-in zones (check-in, wifi, etc.)
    // Their primary_item/appliances should NOT create separate appliance zones
    if (analysis.userCategory && BUILTIN_USER_CATEGORIES.has(analysis.userCategory)) {
      continue
    }

    // Priority: check primary_item first (specific appliance the media focuses on)
    if (analysis.primary_item) {
      const type = analysis.primary_item as CanonicalApplianceType
      if (!processedTypes.has(type)) {
        processedTypes.add(type)
        const registry = APPLIANCE_REGISTRY[type]
        if (registry) {
          const zone = buildSingleApplianceZone(type, registry)
          if (zone) zones.push(zone)
        }
      }
    }

    // Then iterate all detected appliances
    if (!analysis.appliances) continue
    for (const appliance of analysis.appliances) {
      const type = appliance.canonical_type as CanonicalApplianceType
      if (processedTypes.has(type)) continue
      processedTypes.add(type)

      const registry = APPLIANCE_REGISTRY[type]
      if (!registry) continue

      const zone = buildSingleApplianceZone(type, registry)
      if (zone) zones.push(zone)
    }
  }

  return zones
}

// buildSingleApplianceZone is now in zone-builders.ts

// ============================================
// RECOMMENDATION ZONE BUILDER (host-provided places → Claude categorization)
// ============================================

const RECOMMENDATION_MODEL = 'claude-haiku-4-5-20251001'

async function buildRecommendationZones(
  recommendations: string,
  city: string,
  sendEvent: SendEvent,
): Promise<TrilingualZoneConfig[]> {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''
  if (!ANTHROPIC_API_KEY) {
    console.error('[generator] No ANTHROPIC_API_KEY — skipping recommendation zones')
    return []
  }

  sendEvent({ type: 'status', message: 'Categorizando tus recomendaciones...' })

  const prompt = `You are helping generate a vacation rental guest manual for a property in ${city}.

The host recommends these places: "${recommendations}"

Categorize each place and generate a short description (1 sentence) in Spanish, English, and French.

IMPORTANT: Respond with ONLY valid JSON (no markdown fences, no explanation).

Response format:
{
  "categories": [
    {
      "name": {"es": "Restaurantes", "en": "Restaurants", "fr": "Restaurants"},
      "icon": "utensils-crossed",
      "places": [
        {
          "name": "Nou Manolín",
          "description": {
            "es": "Tapas tradicionales alicantinas con productos del mar frescos.",
            "en": "Traditional Alicante tapas with fresh seafood.",
            "fr": "Tapas traditionnelles d'Alicante avec fruits de mer frais."
          }
        }
      ]
    }
  ]
}

Category suggestions (use the most appropriate):
- Restaurantes / Restaurants / Restaurants (icon: utensils-crossed)
- Cafeterías / Cafes / Cafés (icon: coffee)
- Bares / Bars / Bars (icon: wine)
- Actividades / Activities / Activités (icon: star)
- Tiendas / Shops / Boutiques (icon: shopping-bag)
- Cultura / Culture / Culture (icon: landmark)

Rules:
- Group all places into appropriate categories
- Each place gets a 1-sentence trilingual description based on its likely type
- If you don't know the place, write a generic but plausible description for its category
- Keep descriptions short and useful for tourists`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: RECOMMENDATION_MODEL,
        max_tokens: 2048,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      console.error('[generator] Recommendation categorization failed:', response.status)
      return buildFallbackRecommendationZone(recommendations)
    }

    const data = await response.json()
    const text = data.content?.[0]?.text
    if (!text) return buildFallbackRecommendationZone(recommendations)

    const jsonStr = text.replace(/```json\s*\n?/g, '').replace(/```\s*$/g, '').trim()
    const parsed = JSON.parse(jsonStr)

    if (!parsed.categories || !Array.isArray(parsed.categories)) {
      return buildFallbackRecommendationZone(recommendations)
    }

    const zones: TrilingualZoneConfig[] = []

    for (const cat of parsed.categories) {
      if (!cat.places || cat.places.length === 0) continue

      const steps: TrilingualZoneConfig['steps'] = cat.places.map((place: any) => ({
        type: 'text',
        title: {
          es: place.name,
          en: place.name,
          fr: place.name,
        },
        content: {
          es: place.description?.es || place.name,
          en: place.description?.en || place.name,
          fr: place.description?.fr || place.name,
        },
      }))

      zones.push({
        name: {
          es: cat.name?.es || 'Recomendaciones',
          en: cat.name?.en || 'Recommendations',
          fr: cat.name?.fr || 'Recommandations',
        },
        icon: cat.icon || 'star',
        description: {
          es: `Recomendaciones del anfitrión en ${city}`,
          en: `Host recommendations in ${city}`,
          fr: `Recommandations de l'hôte à ${city}`,
        },
        steps,
        needsTranslation: false, // Already trilingual from Claude
      })
    }

    return zones
  } catch (err) {
    console.error('[generator] Recommendation categorization error:', err)
    return buildFallbackRecommendationZone(recommendations)
  }
}

function buildFallbackRecommendationZone(recommendations: string): TrilingualZoneConfig[] {
  const places = recommendations.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean)
  if (places.length === 0) return []

  return [{
    name: {
      es: 'Recomendaciones del Anfitrión',
      en: 'Host Recommendations',
      fr: "Recommandations de l'Hôte",
    },
    icon: 'star',
    description: {
      es: 'Sitios recomendados por tu anfitrión',
      en: 'Places recommended by your host',
      fr: 'Lieux recommandés par votre hôte',
    },
    steps: places.map(place => ({
      type: 'text',
      title: { es: place, en: place, fr: place },
      content: { es: place, en: place, fr: place },
    })),
    needsTranslation: false,
  }]
}

// ============================================
// LOCATION ZONE BUILDERS (Google Places, ES-only → needs translation)
// ============================================

function buildLocationZones(
  locationData: Awaited<ReturnType<typeof fetchAllLocationData>>,
  propertyInput: PropertyInput,
  hasRecommendations: boolean = false,
): TrilingualZoneConfig[] {
  const zones: TrilingualZoneConfig[] = []

  // How to get there — professional format matching zone-content-templates
  const dirSteps: TrilingualZoneConfig['steps'] = []
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${propertyInput.lat},${propertyInput.lng}`
  const address = `${propertyInput.street}, ${propertyInput.postalCode} ${propertyInput.city}`

  // Airport (taxi only — transit directions are often unreliable)
  const airportD = locationData.directions.drivingFromAirport
  if (airportD) {
    const parts: string[] = [
      `✈️ **Aeropuerto de ${propertyInput.city}**`,
      `🚕 **Taxi:**\n• Duración: ~${airportD.duration}\n• Distancia: ${airportD.distance}\n• Dile al taxista: "${address}"`,
      `📱 **Apps recomendadas:** Uber, Cabify, FreeNow`,
    ]
    dirSteps.push({ type: 'text', title: { es: 'Desde el aeropuerto', en: '', fr: '' }, content: { es: parts.join('\n\n'), en: '', fr: '' } })
  }

  // Train station (taxi only)
  const trainD = locationData.directions.drivingFromTrainStation
  if (trainD) {
    const parts: string[] = [
      `🚂 **Estación de tren de ${propertyInput.city}**`,
      `🚕 **Taxi:** ~${trainD.duration}, ${trainD.distance}`,
    ]
    dirSteps.push({ type: 'text', title: { es: 'Desde la estación de tren', en: '', fr: '' }, content: { es: parts.join('\n\n'), en: '', fr: '' } })
  }

  // Bus station (taxi only)
  const busD = locationData.directions.drivingFromBusStation
  if (busD) {
    const parts: string[] = [
      `🚌 **Estación de autobuses de ${propertyInput.city}**`,
      `🚕 **Taxi:** ~${busD.duration}, ${busD.distance}`,
    ]
    dirSteps.push({ type: 'text', title: { es: 'Desde la estación de autobuses', en: '', fr: '' }, content: { es: parts.join('\n\n'), en: '', fr: '' } })
  }

  // By car (always)
  const parkingNote = propertyInput.hasParking === 'yes'
    ? 'Dispone de parking privado'
    : 'No incluido — consulta la sección Aparcamientos'
  dirSteps.push({
    type: 'text',
    title: { es: 'En coche', en: '', fr: '' },
    content: { es: `🚗 **Dirección GPS:** ${address}\n\n**Coordenadas:** ${propertyInput.lat}, ${propertyInput.lng}\n\n📍 **Google Maps:** ${mapsLink}\n📍 **Waze:** https://waze.com/ul?ll=${propertyInput.lat},${propertyInput.lng}&navigate=yes\n\n🅿️ **Parking:** ${parkingNote}`, en: '', fr: '' },
  })

  zones.push({
    name: { es: 'Cómo Llegar', en: '', fr: '' },
    icon: 'map-pin',
    description: { es: 'Direcciones desde aeropuerto, tren, autobús y ubicación exacta', en: '', fr: '' },
    steps: dirSteps,
    needsTranslation: true,
  })

  // NOTE: Parking, supermarkets, restaurants, pharmacies, attractions, transit, etc.
  // are now handled by the Recommendations system (interactive cards with
  // photos, opening hours, AI descriptions, sorted by distance). No more text zones.

  return zones
}

// ============================================
// MAIN GENERATION ORCHESTRATOR
// ============================================

export async function generateManual(
  userId: string,
  propertyInput: PropertyInput,
  mediaAnalysis: MediaAnalysisResult[],
  sendEvent: SendEvent,
): Promise<string> {
  const startTime = Date.now()
  let totalSteps = 0
  let totalZones = 0

  try {
    // ── 1. Create property in DB ──
    sendEvent({ type: 'status', message: 'Creando tu propiedad...' })

    const baseSlug = generateSlug(propertyInput.name)
    let uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`

    let property
    let attempts = 0
    while (!property && attempts < 10) {
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
      const propertyCode = generatePropertyNumber(highestNumber + attempts)

      try {
        property = await prisma.property.create({
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
            maxGuests: propertyInput.maxGuests || propertyInput.bedrooms * 2 + 1,
            hostContactName: propertyInput.hostContactName,
            hostContactPhone: propertyInput.hostContactPhone,
            hostContactEmail: propertyInput.hostContactEmail,
            hostContactLanguage: propertyInput.hostContactLanguage || 'es',
            hostContactPhoto: propertyInput.hostContactPhoto || null,
            profileImage: propertyInput.profileImage || null,
            squareMeters: propertyInput.squareMeters || null,
            status: 'DRAFT',
            isPublished: false,
            hostId: userId,
            analytics: { create: {} },
          },
        })
      } catch (err: any) {
        if (err?.code === 'P2002') {
          const target = err?.meta?.target
          if (Array.isArray(target) && target.includes('slug')) {
            uniqueSlug = `${baseSlug}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
          }
          attempts++
          continue
        }
        throw err
      }
    }
    if (!property) throw new Error('Unable to create property after multiple attempts')

    // ── 2. Fetch location data ──
    sendEvent({ type: 'status', message: 'Analizando ubicación y alrededores...' })

    const isMock = process.env.MOCK_AI === 'true'
    const locationData = isMock
      ? { directions: {} } as any
      : await fetchAllLocationData(
          propertyInput.lat,
          propertyInput.lng,
          propertyInput.city,
        )

    // ── 3. Build ALL zones (template-first) ──
    sendEvent({ type: 'status', message: 'Generando manual profesional...' })

    // Normalize media analysis (handle old format)
    const normalizedMedia = mediaAnalysis.map(normalizeMediaInput)

    const allZones: TrilingualZoneConfig[] = []
    const zoneIdsNeedingTranslation = new Set<string>()

    // Essential zones (template-based, already trilingual)
    allZones.push(buildCheckInZone(propertyInput))

    if (propertyInput.checkOutTime) {
      allZones.push(buildCheckOutZone(propertyInput))
    }

    const wifiZone = buildWifiZone(propertyInput)
    if (wifiZone) allZones.push(wifiZone)

    allZones.push(buildHouseRulesZone(propertyInput))

    // Appliance zones (one per detected appliance, already trilingual)
    const applianceZones = buildApplianceZones(normalizedMedia)
    allZones.push(...applianceZones)

    // AC zone: add if user said hasAC and not already detected in media
    if (propertyInput.hasAC) {
      const hasACFromMedia = applianceZones.some(z => z.name.es === 'Aire Acondicionado')
      if (!hasACFromMedia) {
        const acZone = buildSingleApplianceZone('air_conditioning', APPLIANCE_REGISTRY.air_conditioning)
        if (acZone) allZones.push(acZone)
      }
    }

    // Recycling zone (always, already trilingual)
    allZones.push(buildRecyclingZone(propertyInput))

    // Emergency zone (template + country-specific numbers, already trilingual)
    // Hospitals are now handled by the Recommendations system
    allZones.push(buildEmergencyZone(propertyInput, []))

    // Recommendation zones (host-provided places, already trilingual)
    const recommendations = (propertyInput.details?.recommendations || '').trim()
    const hasRecommendations = recommendations.length > 0
    if (hasRecommendations && !isMock) {
      const recZones = await buildRecommendationZones(recommendations, propertyInput.city, sendEvent)
      allZones.push(...recZones)
    }

    // Custom zones (media items with category='custom' and customZoneName)
    const customZonesFromMedia = mediaAnalysis.filter(
      (m: any) => m.category === 'custom' && m.customZoneName
    )
    for (const m of customZonesFromMedia) {
      const customName = (m as any).customZoneName as string
      allZones.push({
        name: { es: customName, en: '', fr: '' },
        icon: 'zap',
        description: { es: `Zona personalizada: ${customName}`, en: '', fr: '' },
        steps: [{
          type: 'text',
          title: { es: customName, en: '', fr: '' },
          content: { es: `Zona personalizada del alojamiento.`, en: '', fr: '' },
        }],
        needsTranslation: true,
      })
    }

    // Location zones (ES only, need translation)
    const locationZones = buildLocationZones(locationData, propertyInput, hasRecommendations)
    allZones.push(...locationZones)

    // ── 3.5 Apply custom titles and icons from Step 4 ──
    const cTitles = propertyInput.customTitles || {}
    const cIcons = propertyInput.customIcons || {}

    for (const zoneConfig of allZones) {
      // Build the review zone ID the same way Step4Review does
      const applianceKey = Object.keys(APPLIANCE_REGISTRY).find(
        k => APPLIANCE_REGISTRY[k as CanonicalApplianceType].nameEs === zoneConfig.name.es
      )
      const reviewZoneId = applianceKey ? `appliance-${applianceKey}` : generateSlug(zoneConfig.name.es)

      // Apply custom title
      if (cTitles[reviewZoneId]) {
        zoneConfig.name.es = cTitles[reviewZoneId]
        zoneConfig.name.en = ''
        zoneConfig.name.fr = ''
        zoneConfig.needsTranslation = true
      }

      // Apply custom icon
      if (cIcons[reviewZoneId]) {
        zoneConfig.icon = cIcons[reviewZoneId]
      }
    }

    // ── 3.6 Apply reviewed content overrides from Step 4 (renumbered) ──
    const reviewed = propertyInput.reviewedContent || {}
    const reviewIdMap: Record<string, string> = {
      'Check In': 'check-in',
      'Check Out': 'check-out',
      'WiFi': 'wifi',
      'Normas de la Casa': 'house-rules',
      'Emergencias': 'emergency-contacts',
      'Reciclaje': 'recycling',
      'Aire Acondicionado': 'air-conditioning',
      'Cómo Llegar': 'directions',
      'Cómo llegar': 'directions',
    }

    for (const zoneConfig of allZones) {
      const reviewId = reviewIdMap[zoneConfig.name.es] || generateSlug(zoneConfig.name.es)
      if (reviewed[reviewId] && zoneConfig.steps.length > 0) {
        // User edited this zone's content — override the ES version of the first step
        // (the review step shows all content as a single block, so merge into step[0])
        zoneConfig.steps[0].content.es = reviewed[reviewId]
        // Mark for re-translation since user edited the Spanish content
        zoneConfig.needsTranslation = true
      }
    }

    // ── 3.7 Filter disabled zones from review step ──
    const disabledSet = new Set(propertyInput.disabledZones || [])
    const zoneIdMap: Record<string, string> = {
      'Check In': 'check-in',
      'Check Out': 'check-out',
      'WiFi': 'wifi',
      'Normas de la Casa': 'house-rules',
      'Emergencias': 'emergency-contacts',
      'Reciclaje': 'recycling',
      'Aire Acondicionado': 'air-conditioning',
      'Cómo Llegar': 'directions',
      'Cómo llegar': 'directions',
      'Agua caliente': 'hot-water',
    }

    const filteredZones = allZones.filter(z => {
      const reviewId = zoneIdMap[z.name.es] || generateSlug(z.name.es)
      return !disabledSet.has(reviewId)
    })

    // ── 4. Create zones and steps in DB ──
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
          order: order++,
          qrCode: `qr_${timestamp}_${random1}`,
          accessCode: `ac_${timestamp}_${random2}`,
        },
      })

      // Track zones needing translation
      if (zoneConfig.needsTranslation) {
        zoneIdsNeedingTranslation.add(zone.id)
      }

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
          order: idx,
        })),
      })
      totalSteps += zoneConfig.steps.length

      totalZones++

      sendEvent({
        type: 'zone',
        zone: {
          name: zoneConfig.name.es,
          icon: zoneConfig.icon,
          description: zoneConfig.description.es,
          stepsCount: zoneConfig.steps.length,
        },
      })
    }

    // ── 4.5 Assign uploaded media (images/videos) to matching zone steps ──
    await assignMediaToSteps(property.id, mediaAnalysis, filteredZones)

    // ── 5. Translate ONLY location zones (template zones already have 3 languages) ──
    sendEvent({ type: 'translation', language: 'en', progress: 0 })

    if (isMock) {
      // Skip translations in mock mode — just mark as done
      console.log('[generator] MOCK MODE — skipping translations')
      sendEvent({ type: 'translation', language: 'en', progress: 100 })
      sendEvent({ type: 'translation', language: 'fr', progress: 100 })
    } else if (zoneIdsNeedingTranslation.size > 0) {
      const zonesWithSteps = await prisma.zone.findMany({
        where: { propertyId: property.id },
        include: { steps: true },
        orderBy: { order: 'asc' },
      })

      const zonesToTranslate = zonesWithSteps.filter(z => zoneIdsNeedingTranslation.has(z.id))

      // Translate zone names and descriptions
      const zoneNameFields = zonesToTranslate.map(z => ({
        es: (z.name as any)?.es || '',
        en: '',
        fr: '',
      }))
      const zoneDescFields = zonesToTranslate.map(z => ({
        es: (z.description as any)?.es || '',
        en: '',
        fr: '',
      }))

      const [translatedNames, translatedDescs] = await Promise.all([
        translateFields(zoneNameFields),
        translateFields(zoneDescFields),
      ])

      sendEvent({ type: 'translation', language: 'en', progress: 50 })

      await Promise.all(zonesToTranslate.map((zone, i) =>
        prisma.zone.update({
          where: { id: zone.id },
          data: {
            name: {
              es: (zone.name as any)?.es || '',
              en: translatedNames[i].en || '',
              fr: translatedNames[i].fr || '',
            },
            description: {
              es: (zone.description as any)?.es || '',
              en: translatedDescs[i].en || '',
              fr: translatedDescs[i].fr || '',
            },
          },
        })
      ))

      sendEvent({ type: 'translation', language: 'en', progress: 100 })

      // Translate steps of location zones
      sendEvent({ type: 'translation', language: 'fr', progress: 0 })

      for (const zone of zonesToTranslate) {
        if (zone.steps.length === 0) continue

        const stepTitleFields = zone.steps.map(s => ({
          es: (s.title as any)?.es || '',
          en: '',
          fr: '',
        }))
        const stepContentFields = zone.steps.map(s => ({
          es: (s.content as any)?.es || '',
          en: '',
          fr: '',
        }))

        const [translatedTitles, translatedContents] = await Promise.all([
          translateFields(stepTitleFields),
          translateFields(stepContentFields),
        ])

        await Promise.all(zone.steps.map((step, j) =>
          prisma.step.update({
            where: { id: step.id },
            data: {
              title: {
                es: (step.title as any)?.es || '',
                en: translatedTitles[j].en || '',
                fr: translatedTitles[j].fr || '',
              },
              content: {
                es: (step.content as any)?.es || '',
                en: translatedContents[j].en || '',
                fr: translatedContents[j].fr || '',
              },
            },
          })
        ))
      }

      sendEvent({ type: 'translation', language: 'fr', progress: 100 })
    } else {
      // No translation needed — all zones are template-based
      sendEvent({ type: 'translation', language: 'en', progress: 100 })
      sendEvent({ type: 'translation', language: 'fr', progress: 100 })
    }

    // ── 6. Generate QR codes ──
    const allDBZones = await prisma.zone.findMany({
      where: { propertyId: property.id },
      select: { id: true },
    })

    await Promise.all(allDBZones.map(async (zone) => {
      try {
        const qrDataUrl = await generateZoneQRCode(property.id, zone.id)
        await prisma.zone.update({
          where: { id: zone.id },
          data: { qrCode: qrDataUrl },
        })
      } catch (err) {
        console.error(`[generator] QR generation failed for zone ${zone.id}:`, err)
      }
    }))

    // ── 7. Auto-generate nearby recommendations ──
    if (propertyInput.lat && propertyInput.lng) {
      sendEvent({ type: 'status', message: 'Generando recomendaciones locales...' })
      try {
        const recResult = await generateRecommendations(
          property.id,
          propertyInput.lat,
          propertyInput.lng,
          undefined,
          propertyInput.city,
        )
        totalZones += recResult.zonesCreated
        console.log(`[generator] Recommendations: ${recResult.zonesCreated} zones, ${recResult.totalPlaces} places`)
      } catch (err) {
        console.error('[generator] Recommendation generation failed (non-blocking):', err)
      }
    }

    // ── 8. Complete ──
    const elapsedTime = Math.round((Date.now() - startTime) / 1000)

    sendEvent({
      type: 'complete',
      stats: {
        zones: totalZones,
        steps: totalSteps,
        languages: 3,
        time: elapsedTime,
      },
    })

    return property.id
  } catch (error) {
    console.error('[generator] Manual generation failed:', error)
    sendEvent({
      type: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido',
    })
    throw error
  }
}
