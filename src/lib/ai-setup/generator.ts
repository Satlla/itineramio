/**
 * Manual generation orchestrator for AI Setup wizard.
 *
 * Simplified approach:
 * 1. Essential zones (check-in, check-out, wifi, house-rules, emergency, recycling)
 *    → use professional pre-built templates from zone-content-templates.ts (already trilingual)
 * 2. User-defined zones (from media uploads with zone + description)
 *    → user writes description, AI perfects text and translates to EN/FR
 * 3. Location zones (directions)
 *    → dynamic from Google Places (ES only, translated via Claude Haiku)
 * 4. Nearby recommendations (pharmacy, hospital, parking)
 *    → OSM free data only by default
 *
 * Cost: ~€0.05-0.10 per manual (no Vision AI, just text improvement + translation)
 */

import { prisma } from '../prisma'
import { generateSlug } from '../slug-utils'
import { generatePropertyNumber, extractNumberFromReference } from '../property-number-generator'
import { translateFields } from '../translate'
import { generateZoneQRCode } from '../qr'
import { fetchAllLocationData } from './places'
import { getZoneContentTemplate, type ZoneContentTemplate } from '../../data/zone-content-templates'
import {
  APPLIANCE_REGISTRY,
  generateBasicApplianceContent,
  getEmergencyNumbers,
  resolveCountryCode,
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

// ============================================
// TEMPLATE ZONES (must match Step2Media.tsx)
// Only template zones — everything else is a custom user zone.
// ============================================

const PREDEFINED_ZONES = [
  // Template zones (auto-generated from wizard)
  { id: 'check-in', name: 'Check-in', icon: 'key' },
  { id: 'check-out', name: 'Check-out', icon: 'door-open' },
  { id: 'air-conditioning', name: 'Aire Acondicionado', icon: 'snowflake' },
  { id: 'wifi', name: 'WiFi', icon: 'wifi' },
  { id: 'parking', name: 'Parking', icon: 'car' },
  { id: 'recycling', name: 'Basura y reciclaje', icon: 'trash-2' },
  // Appliances
  { id: 'washing_machine', name: 'Lavadora', icon: 'washing-machine' },
  { id: 'dishwasher', name: 'Lavavajillas', icon: 'dishwasher' },
  { id: 'coffee_machine', name: 'Cafetera', icon: 'coffee' },
  { id: 'induction_hob', name: 'Vitrocerámica', icon: 'cooktop' },
  { id: 'oven', name: 'Horno', icon: 'oven' },
  { id: 'microwave', name: 'Microondas', icon: 'microwave' },
  { id: 'television', name: 'Smart TV', icon: 'tv' },
  { id: 'refrigerator', name: 'Frigorífico', icon: 'refrigerator' },
  { id: 'dryer', name: 'Secadora', icon: 'wind' },
  { id: 'iron_appliance', name: 'Plancha', icon: 'iron' },
  { id: 'heater', name: 'Calefacción', icon: 'thermometer' },
  { id: 'safe', name: 'Caja Fuerte', icon: 'lock' },
  // Spaces
  { id: 'pool', name: 'Piscina', icon: 'waves' },
  { id: 'terrace', name: 'Terraza', icon: 'umbrella' },
  { id: 'garden', name: 'Jardín', icon: 'trees' },
  { id: 'bbq', name: 'Barbacoa', icon: 'flame' },
  { id: 'jacuzzi', name: 'Jacuzzi', icon: 'bath' },
]

// Emoji → lucide icon mapping for custom zones
const EMOJI_TO_ICON: Record<string, string> = {
  '🔑': 'key', '🍳': 'kitchen', '🚿': 'bathroom', '🛏️': 'bed',
  '🛋️': 'sofa', '🌳': 'trees', '🏊': 'pool', '🚗': 'parking',
  '🧺': 'laundry', '🌡️': 'snowflake', '📺': 'tv', '☕': 'coffee',
  '🏋️': 'dumbbell', '🎮': 'gamepad-2', '🧹': 'paintbrush', '🔧': 'wrench',
  '📋': 'clipboard', '⚡': 'zap', '🚰': 'bathroom', '🏠': 'home',
  '❄️': 'snowflake', '☀️': 'sun', '🅿️': 'parking',
}

// ============================================
// USER MEDIA ZONE BUILDERS (AI perfects + translates)
// ============================================

const HAIKU_MODEL = 'claude-haiku-4-5-20251001'

/**
 * Improve user description and translate to EN/FR using Claude Haiku.
 * Returns trilingual content + zone name translations.
 */
async function improveAndTranslate(
  zoneName: string,
  userDescription: string,
): Promise<{
  es: string; en: string; fr: string
  nameEn: string; nameFr: string
}> {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''
  if (!ANTHROPIC_API_KEY) {
    return { es: userDescription, en: userDescription, fr: userDescription, nameEn: zoneName, nameFr: zoneName }
  }

  const prompt = `Eres un redactor profesional de manuales de alojamiento turístico.
El usuario ha escrito esta descripción para la zona "${zoneName}":

"${userDescription}"

Mejora la redacción para que sea clara, profesional y útil para un huésped.
- Mantén el contenido original, solo mejora la forma
- Usa formato con emojis y negritas (**) para facilitar la lectura
- Añade pasos numerados si es una instrucción
- No inventes información que no esté en el original
- Máximo 200 palabras

IMPORTANTE: Responde SOLO con JSON válido, sin markdown fences ni explicación:
{"zoneName":{"es":"${zoneName}","en":"...","fr":"..."},"content":{"es":"...","en":"...","fr":"..."}}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: HAIKU_MODEL,
        max_tokens: 1024,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      return { es: userDescription, en: userDescription, fr: userDescription, nameEn: zoneName, nameFr: zoneName }
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    const jsonStr = text.replace(/```json\s*\n?/g, '').replace(/```\s*$/g, '').trim()
    const parsed = JSON.parse(jsonStr)

    return {
      es: parsed.content?.es || userDescription,
      en: parsed.content?.en || userDescription,
      fr: parsed.content?.fr || userDescription,
      nameEn: parsed.zoneName?.en || zoneName,
      nameFr: parsed.zoneName?.fr || zoneName,
    }
  } catch (err) {
    return { es: userDescription, en: userDescription, fr: userDescription, nameEn: zoneName, nameFr: zoneName }
  }
}

/**
 * Build zones from user-uploaded media with zone assignments and descriptions.
 * Groups media items by zone, improves text with AI, and translates.
 * Each zone gets media URLs embedded for later assignment.
 */
interface UserZoneConfig extends TrilingualZoneConfig {
  mediaItems?: Array<{ url: string; type: 'image' | 'video' }>
}

// Zone IDs that are auto-generated by the wizard (Step4Review) — media for these
// is attached via assignTemplateZoneMedia, NOT created as separate user zones
const TEMPLATE_ZONE_IDS = new Set([
  'check-in', 'check-out', 'air-conditioning', 'wifi', 'recycling', 'parking',
])

async function buildUserMediaZones(
  mediaItems: any[],
  sendEvent: SendEvent,
  isMock: boolean,
): Promise<UserZoneConfig[]> {
  // Group media items by zone (skip template zones — handled by assignTemplateZoneMedia)
  const zoneGroups = new Map<string, {
    name: string
    icon: string
    items: Array<{ url: string; type: string; description: string }>
  }>()

  for (const item of mediaItems) {
    if (!item.zoneId && !item.customZoneName?.trim()) continue
    // Skip template zones — their media is attached to auto-generated zones later
    if (item.zoneId && TEMPLATE_ZONE_IDS.has(item.zoneId)) continue

    const key = (item.zoneId && item.zoneId !== '__custom__')
      ? item.zoneId
      : `custom-${item.customZoneName?.trim() || 'unnamed'}`
    if (!zoneGroups.has(key)) {
      const predefined = PREDEFINED_ZONES.find(z => z.id === item.zoneId)
      // Support both old emoji values and new icon ID strings (e.g. 'shower', 'bath')
      const iconFromCustom = item.customZoneIcon
        ? (EMOJI_TO_ICON[item.customZoneIcon] || item.customZoneIcon || 'zap')
        : 'zap'
      zoneGroups.set(key, {
        name: predefined?.name || item.customZoneName || 'Zona',
        icon: predefined?.icon || iconFromCustom,
        items: [],
      })
    }
    zoneGroups.get(key)!.items.push({
      url: item.url,
      type: item.type,
      description: item.description || '',
    })
  }

  const zones: UserZoneConfig[] = []

  for (const [, group] of zoneGroups) {
    sendEvent({ type: 'status', message: `Perfeccionando zona: ${group.name}...` })

    // Combine descriptions from all items in this zone (skip empty ones)
    const combinedDesc = group.items.map(i => i.description).filter(Boolean).join('\n\n') || `Instrucciones de ${group.name}`

    let improved: { es: string; en: string; fr: string; nameEn: string; nameFr: string }

    if (isMock) {
      improved = {
        es: combinedDesc,
        en: combinedDesc,
        fr: combinedDesc,
        nameEn: group.name,
        nameFr: group.name,
      }
    } else {
      improved = await improveAndTranslate(group.name, combinedDesc)
    }

    zones.push({
      name: { es: group.name, en: improved.nameEn, fr: improved.nameFr },
      icon: group.icon,
      description: {
        es: `Instrucciones de ${group.name}`,
        en: `${improved.nameEn} instructions`,
        fr: `Instructions ${improved.nameFr}`,
      },
      steps: [{
        type: 'text',
        title: { es: group.name, en: improved.nameEn, fr: improved.nameFr },
        content: { es: improved.es, en: improved.en, fr: improved.fr },
      }],
      needsTranslation: false, // Already trilingual from Claude
      mediaItems: group.items.map(i => ({ url: i.url, type: i.type as 'image' | 'video' })),
    })
  }

  return zones
}

// ============================================
// MEDIA ASSIGNMENT (new format: zoneId / customZoneName)
// ============================================

/**
 * Assign uploaded media (images/videos) to the matching zone steps.
 * Uses the user zone configs to match media by zone name.
 */
async function assignMediaToSteps(
  propertyId: string,
  userZoneConfigs: UserZoneConfig[],
): Promise<void> {
  if (userZoneConfigs.length === 0) return

  const dbZones = await prisma.zone.findMany({
    where: { propertyId },
    include: { steps: { orderBy: { order: 'asc' } } },
    orderBy: { order: 'asc' },
  })

  for (const userZone of userZoneConfigs) {
    if (!userZone.mediaItems || userZone.mediaItems.length === 0) continue

    // Find the DB zone matching this user zone by name
    const dbZone = dbZones.find(z => {
      const name = typeof z.name === 'object' ? (z.name as any).es : z.name
      return name === userZone.name.es
    })

    if (!dbZone || dbZone.steps.length === 0) continue

    // Assign first media item to the zone's first (text) step
    const firstMedia = userZone.mediaItems[0]
    const firstMediaType = firstMedia.type === 'video' ? 'VIDEO' : 'IMAGE'
    const existingContent = (dbZone.steps[0].content as any) || {}

    await prisma.step.update({
      where: { id: dbZone.steps[0].id },
      data: {
        type: firstMediaType,
        content: { ...existingContent, mediaUrl: firstMedia.url },
      },
    })

    // Create additional steps for remaining media items
    const remainingMedia = userZone.mediaItems.slice(1)
    if (remainingMedia.length > 0) {
      const maxOrder = dbZone.steps[dbZone.steps.length - 1]?.order ?? 0
      const zoneName = userZone.name
      await prisma.step.createMany({
        data: remainingMedia.map((media, i) => ({
          zoneId: dbZone.id,
          type: media.type === 'video' ? 'VIDEO' : 'IMAGE',
          title: {
            es: zoneName.es,
            en: zoneName.en || zoneName.es,
            fr: zoneName.fr || zoneName.es,
          },
          content: {
            es: '',
            en: '',
            fr: '',
            mediaUrl: media.url,
          },
          order: maxOrder + 1 + i,
        })),
      })
    }

  }
}

/**
 * Assign media from template zones (checkin, ac) to matching DB zones.
 * Template zone media has a zoneId but no description — it's attached to the auto-generated zone.
 */
async function assignTemplateZoneMedia(
  propertyId: string,
  mediaItems: any[],
): Promise<void> {
  // Map ONLY auto-generated zone IDs to DB zone name patterns (ES)
  // These are zones that Step4Review creates automatically — NOT appliances or user zones
  const TEMPLATE_TO_NAME: Record<string, string[]> = {
    'check-in': ['Check In', 'Check-in'],
    'check-out': ['Check Out', 'Check-out'],
    'air-conditioning': ['Aire Acondicionado', 'Aire acondicionado', 'Aire acondicionado / Calefacción'],
    'wifi': ['WiFi', 'Wifi'],
    'recycling': ['Basura y reciclaje', 'Reciclaje'],
    'parking': ['Parking'],
  }

  const templateMedia = mediaItems.filter(m =>
    m.zoneId && Object.keys(TEMPLATE_TO_NAME).includes(m.zoneId)
  )
  if (templateMedia.length === 0) return

  const dbZones = await prisma.zone.findMany({
    where: { propertyId },
    include: { steps: { orderBy: { order: 'asc' }, take: 1 } },
    orderBy: { order: 'asc' },
  })

  for (const item of templateMedia) {
    const namePatterns = TEMPLATE_TO_NAME[item.zoneId] || []
    const dbZone = dbZones.find(z => {
      const name = typeof z.name === 'object' ? (z.name as any).es : z.name
      return namePatterns.some(pattern => name === pattern)
    })

    if (!dbZone || dbZone.steps.length === 0) continue

    const mediaType = item.type === 'video' ? 'VIDEO' : 'IMAGE'
    const existingContent = (dbZone.steps[0].content as any) || {}

    await prisma.step.update({
      where: { id: dbZone.steps[0].id },
      data: {
        type: mediaType,
        content: { ...existingContent, mediaUrl: item.url },
      },
    })

  }
}

// ============================================
// RECOMMENDATION ZONE BUILDER (host-provided places → Claude categorization)
// ============================================

async function buildRecommendationZones(
  recommendations: string,
  city: string,
  sendEvent: SendEvent,
): Promise<TrilingualZoneConfig[]> {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''
  if (!ANTHROPIC_API_KEY) {
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
        model: HAIKU_MODEL,
        max_tokens: 2048,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
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
        needsTranslation: false,
      })
    }

    return zones
  } catch (err) {
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
): TrilingualZoneConfig[] {
  const zones: TrilingualZoneConfig[] = []

  const dirSteps: TrilingualZoneConfig['steps'] = []
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${propertyInput.lat},${propertyInput.lng}`
  const address = `${propertyInput.street}, ${propertyInput.postalCode} ${propertyInput.city}`

  // Airport (taxi only)
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

  return zones
}

// ============================================
// MAIN GENERATION ORCHESTRATOR
// ============================================

export async function generateManual(
  userId: string,
  propertyInput: PropertyInput,
  mediaAnalysis: any[],
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
            intelligence: propertyInput.intelligence || undefined,
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

    // ── 3. Build ALL zones ──
    sendEvent({ type: 'status', message: 'Generando manual profesional...' })

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

    // User-defined zones from media (AI perfects + translates)
    // Template zone media (check-in, AC, etc.) is already filtered inside buildUserMediaZones
    const userZones = await buildUserMediaZones(mediaAnalysis, sendEvent, isMock)
    allZones.push(...userZones)

    // AC zone: add if user said hasAC and not already covered by user zones
    if (propertyInput.hasAC) {
      const hasACFromUser = userZones.some(z =>
        z.name.es.toLowerCase().includes('aire') || z.name.es.toLowerCase().includes('calefac')
      )
      if (!hasACFromUser) {
        const acZone = buildSingleApplianceZone('air_conditioning', APPLIANCE_REGISTRY.air_conditioning)
        if (acZone) allZones.push(acZone)
      }
    }

    // Recycling zone (always, already trilingual)
    allZones.push(buildRecyclingZone(propertyInput))

    // Emergency zone (template + country-specific numbers, already trilingual)
    allZones.push(buildEmergencyZone(propertyInput, []))

    // Recommendation zones (host-provided places, already trilingual)
    const recommendations = (propertyInput.details?.recommendations || '').trim()
    const hasRecommendations = recommendations.length > 0
    if (hasRecommendations && !isMock) {
      const recZones = await buildRecommendationZones(recommendations, propertyInput.city, sendEvent)
      allZones.push(...recZones)
    }

    // Location zones (ES only, need translation)
    const locationZones = buildLocationZones(locationData, propertyInput)
    allZones.push(...locationZones)

    // Shared map: zone name (ES) → review ID used by Step4Review as zone.id keys
    const zoneNameToReviewId: Record<string, string> = {
      'Check In': 'check-in',
      'Check Out': 'check-out',
      'WiFi': 'wifi',
      'Normas de la Casa': 'house-rules',
      'Emergencias': 'emergency-contacts',
      'Teléfonos de interés': 'emergency-contacts',
      'Reciclaje': 'recycling',
      'Basura y reciclaje': 'recycling',
      'Aire Acondicionado': 'air-conditioning',
      'Cómo Llegar': 'directions',
      'Cómo llegar': 'directions',
      'Agua caliente': 'hot-water',
    }

    // ── 3.5 Apply custom titles and icons from Step 4 ──
    const cTitles = propertyInput.customTitles || {}
    const cIcons = propertyInput.customIcons || {}

    for (const zoneConfig of allZones) {
      const applianceKey = Object.keys(APPLIANCE_REGISTRY).find(
        k => APPLIANCE_REGISTRY[k as CanonicalApplianceType].nameEs === zoneConfig.name.es
      )
      const reviewZoneId = applianceKey
        ? `appliance-${applianceKey}`
        : (zoneNameToReviewId[zoneConfig.name.es] || generateSlug(zoneConfig.name.es))

      if (cTitles[reviewZoneId]) {
        zoneConfig.name.es = cTitles[reviewZoneId]
        zoneConfig.name.en = ''
        zoneConfig.name.fr = ''
        zoneConfig.needsTranslation = true
      }

      if (cIcons[reviewZoneId]) {
        zoneConfig.icon = cIcons[reviewZoneId]
      }
    }

    // ── 3.6 Apply reviewed content overrides from Step 4 ──
    const reviewed = propertyInput.reviewedContent || {}
    const reviewIdMap: Record<string, string> = {
      'Check In': 'check-in',
      'Check Out': 'check-out',
      'WiFi': 'wifi',
      'Normas de la Casa': 'house-rules',
      'Emergencias': 'emergency-contacts',
      'Teléfonos de interés': 'emergency-contacts',
      'Reciclaje': 'recycling',
      'Aire Acondicionado': 'air-conditioning',
      'Cómo Llegar': 'directions',
      'Cómo llegar': 'directions',
    }

    for (const zoneConfig of allZones) {
      const reviewId = reviewIdMap[zoneConfig.name.es] || generateSlug(zoneConfig.name.es)
      if (reviewed[reviewId] && zoneConfig.steps.length > 0) {
        zoneConfig.steps[0].content.es = reviewed[reviewId]
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
      'Teléfonos de interés': 'emergency-contacts',
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
          isPublished: true,
          order: order++,
          qrCode: `qr_${timestamp}_${random1}`,
          accessCode: `ac_${timestamp}_${random2}`,
        },
      })

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
          isPublished: true,
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
    await assignMediaToSteps(property.id, userZones)

    // Also assign media from template zones (checkin, ac)
    await assignTemplateZoneMedia(property.id, mediaAnalysis)

    // ── 5. Translate ONLY zones that need it (location zones, edited zones) ──
    sendEvent({ type: 'translation', language: 'en', progress: 0 })

    if (isMock) {
      sendEvent({ type: 'translation', language: 'en', progress: 100 })
      sendEvent({ type: 'translation', language: 'fr', progress: 100 })
    } else if (zoneIdsNeedingTranslation.size > 0) {
      const zonesWithSteps = await prisma.zone.findMany({
        where: { propertyId: property.id },
        include: { steps: true },
        orderBy: { order: 'asc' },
      })

      const zonesToTranslate = zonesWithSteps.filter(z => zoneIdsNeedingTranslation.has(z.id))

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
        // QR generation failed, continue
      }
    }))

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
    sendEvent({
      type: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido',
    })
    throw error
  }
}
