/**
 * Main Places orchestrator service.
 * Coordinates OSM + Google searches with caching and Place-table deduplication.
 */

import { prisma } from '../prisma'
import {
  CATEGORIES,
  CategoryConfig,
  CACHE_TTL_MS,
  geoTileKey,
  getCategoriesBySource,
} from './categories'
import { searchOsm, OsmPlace } from './osm-service'
import { searchGoogle, GooglePlace } from './google-service'

/** Unified result from any source */
export interface PlaceResult {
  /** Place table record ID (after upsert) */
  placeDbId: string
  name: string
  address: string
  latitude: number
  longitude: number
  source: 'OSM' | 'GOOGLE'
  rating?: number
  priceLevel?: number
  types?: string[]
  phone?: string
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

/**
 * Check the NearbyCache for a previously cached search.
 * Returns cached Place IDs if cache is fresh, null otherwise.
 */
async function getCachedResults(
  tileKey: string,
  categoryId: string
): Promise<string[] | null> {
  try {
    const cached = await prisma.nearbyCache.findUnique({
      where: { tileKey_category: { tileKey, category: categoryId } },
    })

    if (!cached) return null

    // Check if cache is still fresh
    const age = Date.now() - cached.lastFetchedAt.getTime()
    if (age > CACHE_TTL_MS) return null

    return cached.placeIds as string[]
  } catch {
    return null
  }
}

/**
 * Store search results in the NearbyCache.
 */
async function setCacheResults(
  tileKey: string,
  categoryId: string,
  placeDbIds: string[]
): Promise<void> {
  try {
    await prisma.nearbyCache.upsert({
      where: { tileKey_category: { tileKey, category: categoryId } },
      update: {
        placeIds: placeDbIds,
        lastFetchedAt: new Date(),
      },
      create: {
        tileKey,
        category: categoryId,
        placeIds: placeDbIds,
        lastFetchedAt: new Date(),
      },
    })
  } catch (error) {
    console.error(`[cache] Error saving cache for ${categoryId}:`, error)
  }
}

/**
 * Upsert an OSM place into the Place table for deduplication.
 */
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

/**
 * Upsert a Google place into the Place table for deduplication.
 */
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
      lastFetchedAt: new Date(),
    },
  })
  return record.id
}

/**
 * Load Place records from DB by their IDs, preserving order.
 */
async function loadPlacesFromDb(placeDbIds: string[]): Promise<PlaceResult[]> {
  if (placeDbIds.length === 0) return []

  const places = await prisma.place.findMany({
    where: { id: { in: placeDbIds } },
  })

  // Build a map for ordering
  const placeMap = new Map(places.map(p => [p.id, p]))

  return placeDbIds
    .map(id => placeMap.get(id))
    .filter(Boolean)
    .map(p => ({
      placeDbId: p!.id,
      name: p!.name,
      address: p!.address,
      latitude: p!.latitude,
      longitude: p!.longitude,
      source: p!.source as 'OSM' | 'GOOGLE',
      rating: p!.rating ?? undefined,
      priceLevel: p!.priceLevel ?? undefined,
      types: (p!.types as string[]) ?? undefined,
      phone: p!.phone ?? undefined,
      openingHours: p!.openingHours,
      businessStatus: p!.businessStatus ?? undefined,
      distanceMeters: 0, // Will be recalculated if needed
      walkMinutes: 0,
    }))
}

/**
 * Search a single category with caching and deduplication.
 */
async function searchCategory(
  lat: number,
  lng: number,
  category: CategoryConfig,
  tileKey: string
): Promise<PlaceResult[]> {
  // 1. Check cache
  const cachedIds = await getCachedResults(tileKey, category.id)
  if (cachedIds) {
    console.log(`[places] Cache HIT for ${category.id} tile=${tileKey}`)
    return loadPlacesFromDb(cachedIds)
  }

  console.log(`[places] Cache MISS for ${category.id} tile=${tileKey} — fetching`)

  // 2. Fetch from source
  let results: PlaceResult[]

  if (category.source === 'OSM') {
    const osmPlaces = await searchOsm(lat, lng, category)
    // Upsert each place and collect DB IDs
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
          tags: p.tags,
          distanceMeters: p.distanceMeters,
          walkMinutes: p.walkMinutes,
        }
      })
    )
    results = entries
  } else {
    const googlePlaces = await searchGoogle(lat, lng, category)
    const entries = await Promise.all(
      googlePlaces.map(async (p) => {
        const dbId = await upsertGooglePlace(p)
        return {
          placeDbId: dbId,
          name: p.name,
          address: p.address,
          latitude: p.latitude,
          longitude: p.longitude,
          source: 'GOOGLE' as const,
          rating: p.rating,
          priceLevel: p.priceLevel,
          types: p.types,
          businessStatus: p.businessStatus,
          distanceMeters: p.distanceMeters,
          walkMinutes: p.walkMinutes,
        }
      })
    )
    results = entries
  }

  // 3. Save to cache
  const placeDbIds = results.map(r => r.placeDbId)
  await setCacheResults(tileKey, category.id, placeDbIds)

  return results
}

/**
 * Fetch all nearby places for given coordinates, across all categories.
 * Uses geo-tile caching and Place table deduplication.
 *
 * @param lat - Property latitude
 * @param lng - Property longitude
 * @param categoryIds - Optional: only fetch specific categories. If empty, fetches all.
 * @returns Array of CategoryResults, one per category with results
 */
export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  categoryIds?: string[]
): Promise<CategoryResults[]> {
  if (!lat || !lng || (lat === 0 && lng === 0)) {
    console.error('[places] Invalid coordinates — skipping')
    return []
  }

  const tileKey = geoTileKey(lat, lng)
  const categories = categoryIds
    ? CATEGORIES.filter(c => categoryIds.includes(c.id))
    : CATEGORIES

  // Split into OSM and Google batches
  const osmCategories = categories.filter(c => c.source === 'OSM')
  const googleCategories = categories.filter(c => c.source === 'GOOGLE')

  // Search OSM categories in parallel (free, no rate limit concern)
  const osmPromises = osmCategories.map(cat =>
    searchCategory(lat, lng, cat, tileKey).then(places => ({
      categoryId: cat.id,
      label: cat.label,
      icon: cat.icon,
      places,
    }))
  )

  // Search Google categories in parallel (paid, but few categories)
  const googlePromises = googleCategories.map(cat =>
    searchCategory(lat, lng, cat, tileKey).then(places => ({
      categoryId: cat.id,
      label: cat.label,
      icon: cat.icon,
      places,
    }))
  )

  const allResults = await Promise.all([...osmPromises, ...googlePromises])

  // Only return categories that have at least one result
  return allResults.filter(r => r.places.length > 0)
}

/**
 * Generate recommendation zones for a property.
 * Creates RECOMMENDATIONS-type Zones with linked Recommendation records.
 *
 * @param propertyId - Property ID
 * @param lat - Property latitude
 * @param lng - Property longitude
 * @param categoryIds - Optional: only generate specific categories
 * @returns Number of zones created
 */
export async function generateRecommendations(
  propertyId: string,
  lat: number,
  lng: number,
  categoryIds?: string[]
): Promise<{ zonesCreated: number; totalPlaces: number }> {
  const results = await fetchNearbyPlaces(lat, lng, categoryIds)

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

    // Check if a RECOMMENDATIONS zone for this category already exists
    const existing = await prisma.zone.findFirst({
      where: {
        propertyId,
        type: 'RECOMMENDATIONS',
        recommendationCategory: categoryResult.categoryId,
      },
    })

    if (existing) {
      // Delete old recommendations and recreate
      await prisma.recommendation.deleteMany({
        where: { zoneId: existing.id },
      })

      // Create new recommendations for this existing zone
      await prisma.recommendation.createMany({
        data: categoryResult.places.map((place, index) => ({
          zoneId: existing.id,
          placeId: place.placeDbId,
          source: place.source === 'GOOGLE' ? 'AUTO_GOOGLE' : 'AUTO_OSM',
          distanceMeters: place.distanceMeters,
          walkMinutes: place.walkMinutes,
          order: index,
        })),
      })

      totalPlaces += categoryResult.places.length
      continue
    }

    // Generate unique codes for the zone
    const qrCode = `REC-${propertyId.slice(-6)}-${categoryResult.categoryId}-${Date.now().toString(36)}`
    const accessCode = `R${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase()

    // Create the RECOMMENDATIONS zone
    const zone = await prisma.zone.create({
      data: {
        propertyId,
        name: { es: categoryResult.label },
        description: { es: `${categoryResult.label} cerca de tu alojamiento` },
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

    // Create Recommendation records linking zone to places
    await prisma.recommendation.createMany({
      data: categoryResult.places.map((place, index) => ({
        zoneId: zone.id,
        placeId: place.placeDbId,
        source: place.source === 'GOOGLE' ? 'AUTO_GOOGLE' : 'AUTO_OSM',
        distanceMeters: place.distanceMeters,
        walkMinutes: place.walkMinutes,
        order: index,
      })),
    })

    zonesCreated++
    totalPlaces += categoryResult.places.length
  }

  return { zonesCreated, totalPlaces }
}
