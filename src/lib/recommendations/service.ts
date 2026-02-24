/**
 * Main Places orchestrator service.
 * Coordinates OSM + Google searches with caching, Place-table deduplication,
 * Google Place Details enrichment, and AI-generated descriptions.
 */

import { prisma } from '../prisma'
import {
  CATEGORIES,
  CategoryConfig,
  CACHE_TTL_MS,
  geoTileKey,
} from './categories'
import { searchOsm, OsmPlace } from './osm-service'
import { searchGoogle, GooglePlace, fetchPlaceDetails } from './google-service'

/** Unified result from any source */
export interface PlaceResult {
  placeDbId: string
  placeId?: string // Google place_id for details enrichment
  name: string
  address: string
  latitude: number
  longitude: number
  source: 'OSM' | 'GOOGLE'
  rating?: number
  priceLevel?: number
  types?: string[]
  phone?: string
  website?: string
  photoUrl?: string
  openingHours?: any
  businessStatus?: string
  distanceMeters: number
  walkMinutes: number
}

/** Results for a single category */
export interface CategoryResults {
  categoryId: string
  label: string
  icon: string
  places: PlaceResult[]
}

// ─── Cache helpers ───

async function getCachedResults(
  tileKey: string,
  categoryId: string
): Promise<string[] | null> {
  try {
    const cached = await prisma.nearbyCache.findUnique({
      where: { tileKey_category: { tileKey, category: categoryId } },
    })
    if (!cached) return null
    const age = Date.now() - cached.lastFetchedAt.getTime()
    if (age > CACHE_TTL_MS) return null
    return cached.placeIds as string[]
  } catch {
    return null
  }
}

async function setCacheResults(
  tileKey: string,
  categoryId: string,
  placeDbIds: string[]
): Promise<void> {
  try {
    await prisma.nearbyCache.upsert({
      where: { tileKey_category: { tileKey, category: categoryId } },
      update: { placeIds: placeDbIds, lastFetchedAt: new Date() },
      create: { tileKey, category: categoryId, placeIds: placeDbIds, lastFetchedAt: new Date() },
    })
  } catch (error) {
    console.error(`[cache] Error saving cache for ${categoryId}:`, error)
  }
}

// ─── Place upsert helpers ───

async function upsertOsmPlace(place: OsmPlace): Promise<string> {
  const record = await prisma.place.upsert({
    where: { osmId: place.osmId },
    update: {
      name: place.name,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      lastFetchedAt: new Date(),
    },
    create: {
      osmId: place.osmId,
      source: 'OSM',
      name: place.name,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      types: place.tags,
      lastFetchedAt: new Date(),
    },
  })
  return record.id
}

async function upsertGooglePlace(place: GooglePlace): Promise<string> {
  const record = await prisma.place.upsert({
    where: { placeId: place.placeId },
    update: {
      name: place.name,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      rating: place.rating,
      priceLevel: place.priceLevel,
      types: place.types,
      businessStatus: place.businessStatus,
      photoUrl: place.photoUrl,
      phone: place.phone,
      website: place.website,
      openingHours: place.openingHours,
      lastFetchedAt: new Date(),
    },
    create: {
      placeId: place.placeId,
      source: 'GOOGLE',
      name: place.name,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      rating: place.rating,
      priceLevel: place.priceLevel,
      types: place.types,
      businessStatus: place.businessStatus,
      photoUrl: place.photoUrl,
      phone: place.phone,
      website: place.website,
      openingHours: place.openingHours,
      lastFetchedAt: new Date(),
    },
  })
  return record.id
}

// ─── Place Details enrichment ───

/**
 * Enrich places with Google Place Details (opening hours, phone, website, photo).
 * For OSM places, searches Google by name+coords to find a matching Google place.
 * Only called for categories with fetchDetails=true.
 */
async function enrichWithDetails(
  places: PlaceResult[],
  category: CategoryConfig
): Promise<void> {
  if (!category.fetchDetails || places.length === 0) return

  console.log(`[places] Enriching ${places.length} places for ${category.id} with Google Details`)

  for (const place of places) {
    try {
      let googlePlaceId = place.placeId

      // For OSM places, find the Google place_id by searching by name
      if (!googlePlaceId && place.source === 'OSM') {
        const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(place.name)}&inputtype=textquery&locationbias=point:${place.latitude},${place.longitude}&fields=place_id&key=${process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&language=es`
        const searchRes = await fetch(searchUrl)
        if (searchRes.ok) {
          const searchData = await searchRes.json()
          googlePlaceId = searchData.candidates?.[0]?.place_id
        }
      }

      if (!googlePlaceId) continue

      const details = await fetchPlaceDetails(googlePlaceId)
      if (!details) continue

      // Update Place record in DB with enriched data
      await prisma.place.update({
        where: { id: place.placeDbId },
        data: {
          phone: details.phone || undefined,
          website: details.website || undefined,
          photoUrl: details.photoUrl || undefined,
          openingHours: details.openingHours || undefined,
          rating: details.rating || undefined,
          priceLevel: details.priceLevel || undefined,
        },
      })

      // Update local result
      place.phone = details.phone
      place.website = details.website
      place.photoUrl = details.photoUrl
      place.openingHours = details.openingHours
    } catch (err) {
      console.error(`[places] Details enrichment failed for ${place.name}:`, err)
    }
  }
}

// ─── AI description generation ───

/**
 * Generate brief descriptions for places using Claude Haiku.
 * Returns trilingual descriptions (ES, EN, FR).
 */
async function generateDescriptions(
  places: PlaceResult[],
  categoryLabel: string
): Promise<Map<string, { es: string; en: string; fr: string }>> {
  const descriptions = new Map<string, { es: string; en: string; fr: string }>()
  if (places.length === 0) return descriptions

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_API_KEY) {
    console.log('[places] No ANTHROPIC_API_KEY — skipping AI descriptions')
    return descriptions
  }

  // Build a batch prompt for all places at once (cheaper than individual calls)
  const placesInfo = places.map((p, i) => {
    const hours = Array.isArray(p.openingHours) ? p.openingHours.join(', ') : ''
    return `${i + 1}. "${p.name}" — ${p.address}${p.rating ? ` — ⭐${p.rating}` : ''}${hours ? ` — Horario: ${hours}` : ''}`
  }).join('\n')

  const prompt = `Genera una descripción breve y útil (máximo 15 palabras) para cada lugar.
La descripción debe ayudar a un turista a decidir si le interesa.
Si tienes los horarios, menciona si abre domingos o si es 24h.
Responde SOLO en formato JSON array con objetos {i, es, en, fr} donde i es el número del lugar.

Categoría: ${categoryLabel}
Lugares:
${placesInfo}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      console.error('[places] AI description generation failed:', response.status)
      return descriptions
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return descriptions

    const parsed = JSON.parse(jsonMatch[0]) as Array<{ i: number; es: string; en: string; fr: string }>

    for (const item of parsed) {
      const place = places[item.i - 1]
      if (place) {
        descriptions.set(place.placeDbId, { es: item.es, en: item.en, fr: item.fr })
      }
    }
  } catch (err) {
    console.error('[places] AI description generation error:', err)
  }

  return descriptions
}

// ─── Haversine distance ───

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

const WALK_SPEED_MPM = 80

// ─── Load from DB (for cache hits) ───

async function loadPlacesFromDb(placeDbIds: string[], lat: number, lng: number): Promise<PlaceResult[]> {
  if (placeDbIds.length === 0) return []
  const places = await prisma.place.findMany({
    where: { id: { in: placeDbIds } },
  })
  const placeMap = new Map(places.map(p => [p.id, p]))

  const results = placeDbIds
    .map(id => placeMap.get(id))
    .filter(Boolean)
    .map(p => {
      const distanceMeters = haversineMeters(lat, lng, p!.latitude, p!.longitude)
      return {
        placeDbId: p!.id,
        placeId: p!.placeId ?? undefined,
        name: p!.name,
        address: p!.address,
        latitude: p!.latitude,
        longitude: p!.longitude,
        source: p!.source as 'OSM' | 'GOOGLE',
        rating: p!.rating ?? undefined,
        priceLevel: p!.priceLevel ?? undefined,
        types: (p!.types as string[]) ?? undefined,
        phone: p!.phone ?? undefined,
        website: p!.website ?? undefined,
        photoUrl: p!.photoUrl ?? undefined,
        openingHours: p!.openingHours,
        businessStatus: p!.businessStatus ?? undefined,
        distanceMeters,
        walkMinutes: Math.ceil(distanceMeters / WALK_SPEED_MPM),
      }
    })

  // Sort by distance (closest first)
  results.sort((a, b) => a.distanceMeters - b.distanceMeters)
  return results
}

// ─── Search a single category ───

async function searchCategory(
  lat: number,
  lng: number,
  category: CategoryConfig,
  tileKey: string,
  city?: string
): Promise<PlaceResult[]> {
  // 1. Check cache
  const cachedIds = await getCachedResults(tileKey, category.id)
  if (cachedIds) {
    console.log(`[places] Cache HIT for ${category.id} tile=${tileKey}`)
    return loadPlacesFromDb(cachedIds, lat, lng)
  }

  console.log(`[places] Cache MISS for ${category.id} tile=${tileKey} — fetching`)

  // 2. Fetch from source
  let results: PlaceResult[]

  if (category.source === 'OSM') {
    const osmPlaces = await searchOsm(lat, lng, category)
    const entries = await Promise.all(
      osmPlaces.map(async (p) => {
        const dbId = await upsertOsmPlace(p)
        return {
          placeDbId: dbId,
          name: p.name,
          address: p.address,
          latitude: p.latitude,
          longitude: p.longitude,
          source: 'OSM' as const,
          distanceMeters: p.distanceMeters,
          walkMinutes: p.walkMinutes,
        }
      })
    )
    results = entries
  } else {
    const googlePlaces = await searchGoogle(lat, lng, category, city)
    const entries = await Promise.all(
      googlePlaces.map(async (p) => {
        const dbId = await upsertGooglePlace(p)
        return {
          placeDbId: dbId,
          placeId: p.placeId,
          name: p.name,
          address: p.address,
          latitude: p.latitude,
          longitude: p.longitude,
          source: 'GOOGLE' as const,
          rating: p.rating,
          priceLevel: p.priceLevel,
          types: p.types,
          businessStatus: p.businessStatus,
          photoUrl: p.photoUrl,
          distanceMeters: p.distanceMeters,
          walkMinutes: p.walkMinutes,
        }
      })
    )
    results = entries
  }

  // 3. Enrich with Google Place Details (opening hours, phone, photos)
  await enrichWithDetails(results, category)

  // 4. Save to cache
  const placeDbIds = results.map(r => r.placeDbId)
  await setCacheResults(tileKey, category.id, placeDbIds)

  return results
}

// ─── Public API ───

/**
 * Fetch all nearby places for given coordinates, across all categories.
 */
export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  categoryIds?: string[],
  city?: string
): Promise<CategoryResults[]> {
  if (!lat || !lng || (lat === 0 && lng === 0)) {
    console.error('[places] Invalid coordinates — skipping')
    return []
  }

  const tileKey = geoTileKey(lat, lng)
  const categories = categoryIds
    ? CATEGORIES.filter(c => categoryIds.includes(c.id))
    : CATEGORIES

  const osmCategories = categories.filter(c => c.source === 'OSM')
  const googleCategories = categories.filter(c => c.source === 'GOOGLE')

  const osmPromises = osmCategories.map(cat =>
    searchCategory(lat, lng, cat, tileKey, city).then(places => ({
      categoryId: cat.id,
      label: cat.label,
      icon: cat.icon,
      places,
    }))
  )

  const googlePromises = googleCategories.map(cat =>
    searchCategory(lat, lng, cat, tileKey, city).then(places => ({
      categoryId: cat.id,
      label: cat.label,
      icon: cat.icon,
      places,
    }))
  )

  const allResults = await Promise.all([...osmPromises, ...googlePromises])
  return allResults.filter(r => r.places.length > 0)
}

/**
 * Generate recommendation zones for a property.
 * Fetches places, enriches with details, generates AI descriptions,
 * and creates RECOMMENDATIONS zones with Recommendation records.
 */
export async function generateRecommendations(
  propertyId: string,
  lat: number,
  lng: number,
  categoryIds?: string[],
  city?: string
): Promise<{ zonesCreated: number; totalPlaces: number }> {
  const results = await fetchNearbyPlaces(lat, lng, categoryIds, city)

  if (results.length === 0) {
    return { zonesCreated: 0, totalPlaces: 0 }
  }

  // Get current max order for this property's zones
  const maxOrderResult = await prisma.zone.aggregate({
    where: { propertyId },
    _max: { order: true },
  })
  let currentOrder = (maxOrderResult._max.order ?? -1) + 1

  let zonesCreated = 0
  let totalPlaces = 0

  for (const categoryResult of results) {
    if (categoryResult.places.length === 0) continue

    // Generate AI descriptions for this category's places
    const descriptions = await generateDescriptions(
      categoryResult.places,
      categoryResult.label
    )

    // Check if a RECOMMENDATIONS zone for this category already exists
    const existing = await prisma.zone.findFirst({
      where: {
        propertyId,
        type: 'RECOMMENDATIONS',
        recommendationCategory: categoryResult.categoryId,
      },
    })

    if (existing) {
      await prisma.recommendation.deleteMany({
        where: { zoneId: existing.id },
      })

      await prisma.recommendation.createMany({
        data: categoryResult.places.map((place, index) => {
          const desc = descriptions.get(place.placeDbId)
          return {
            zoneId: existing.id,
            placeId: place.placeDbId,
            source: place.source === 'GOOGLE' ? 'AUTO_GOOGLE' : 'AUTO_OSM',
            description: desc?.es || null,
            descriptionTranslations: desc ? { es: desc.es, en: desc.en, fr: desc.fr } : undefined,
            distanceMeters: place.distanceMeters,
            walkMinutes: place.walkMinutes,
            order: index,
          }
        }),
      })

      totalPlaces += categoryResult.places.length
      continue
    }

    // Generate unique codes
    const qrCode = `REC-${propertyId.slice(-6)}-${categoryResult.categoryId}-${Date.now().toString(36)}`
    const accessCode = `R${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase()

    // Create the RECOMMENDATIONS zone
    const zone = await prisma.zone.create({
      data: {
        propertyId,
        name: { es: categoryResult.label, en: categoryResult.label, fr: categoryResult.label },
        description: {
          es: `${categoryResult.label} cerca de tu alojamiento`,
          en: `${categoryResult.label} near your accommodation`,
          fr: `${categoryResult.label} près de votre hébergement`,
        },
        icon: categoryResult.icon,
        type: 'RECOMMENDATIONS',
        recommendationCategory: categoryResult.categoryId,
        qrCode,
        accessCode,
        status: 'ACTIVE',
        isPublished: true,
        order: currentOrder++,
      },
    })

    // Create Recommendation records with AI descriptions
    await prisma.recommendation.createMany({
      data: categoryResult.places.map((place, index) => {
        const desc = descriptions.get(place.placeDbId)
        return {
          zoneId: zone.id,
          placeId: place.placeDbId,
          source: place.source === 'GOOGLE' ? 'AUTO_GOOGLE' : 'AUTO_OSM',
          description: desc?.es || null,
          descriptionTranslations: desc ? { es: desc.es, en: desc.en, fr: desc.fr } : undefined,
          distanceMeters: place.distanceMeters,
          walkMinutes: place.walkMinutes,
          order: index,
        }
      }),
    })

    zonesCreated++
    totalPlaces += categoryResult.places.length
  }

  return { zonesCreated, totalPlaces }
}
