/**
 * Google Places API helpers for AI Setup wizard.
 * Fetches nearby POIs, directions, and place details for auto-generated manuals.
 */

import { prisma } from '../prisma'

// Server-side key (no referer restriction) for Places/Directions API calls.
// Falls back to the public key for backward compatibility.
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

/** Round lat/lng to 2 decimals (~1km grid) for cache key */
function toTileKey(lat: number, lng: number): string {
  return `${lat.toFixed(2)},${lng.toFixed(2)}`
}

const CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export interface NearbyPlace {
  name: string
  address: string
  rating?: number
  priceLevel?: number
  distance?: string
  lat: number
  lng: number
  placeId: string
  openNow?: boolean
  types: string[]
}

export interface DirectionsResult {
  summary: string
  duration: string
  distance: string
  steps: string[]
  transitDetails?: string
}

export interface PlaceDetails {
  name: string
  address: string
  phone?: string
  website?: string
  rating?: number
  openingHours?: string[]
  priceLevel?: number
}

/**
 * Search for nearby places by type.
 */
export async function searchNearbyPlaces(
  lat: number,
  lng: number,
  type: string,
  radius: number = 1500,
  maxResults: number = 5
): Promise<NearbyPlace[]> {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${GOOGLE_MAPS_API_KEY}&language=es`

  const response = await fetch(url)
  if (!response.ok) {
    console.error(`[places] Nearby search failed for type ${type}:`, response.status)
    return []
  }

  const data = await response.json()
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    console.error(`[places] API error for type ${type}:`, data.status, data.error_message)
    return []
  }

  const results = (data.results || []).slice(0, maxResults)

  return results.map((place: any) => ({
    name: place.name,
    address: place.vicinity || place.formatted_address || '',
    rating: place.rating,
    priceLevel: place.price_level,
    lat: place.geometry?.location?.lat,
    lng: place.geometry?.location?.lng,
    placeId: place.place_id,
    openNow: place.opening_hours?.open_now,
    types: place.types || [],
  }))
}

/**
 * Get details for a specific place.
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  const fields = 'name,formatted_address,formatted_phone_number,website,rating,opening_hours,price_level'
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_MAPS_API_KEY}&language=es`

  const response = await fetch(url)
  if (!response.ok) return null

  const data = await response.json()
  if (data.status !== 'OK') return null

  const result = data.result
  return {
    name: result.name,
    address: result.formatted_address,
    phone: result.formatted_phone_number,
    website: result.website,
    rating: result.rating,
    openingHours: result.opening_hours?.weekday_text,
    priceLevel: result.price_level,
  }
}

/**
 * Get directions from an origin to the property.
 */
export async function getDirections(
  origin: string,
  destLat: number,
  destLng: number,
  mode: 'transit' | 'driving' = 'transit'
): Promise<DirectionsResult | null> {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${destLat},${destLng}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}&language=es`

  const response = await fetch(url)
  if (!response.ok) return null

  const data = await response.json()
  if (data.status !== 'OK' || !data.routes?.[0]) return null

  const route = data.routes[0]
  const leg = route.legs[0]

  const steps = leg.steps?.map((step: any) => {
    let instruction = step.html_instructions?.replace(/<[^>]*>/g, '') || ''
    if (step.transit_details) {
      const td = step.transit_details
      instruction += ` (${td.line?.short_name || td.line?.name || ''} → ${td.headsign || ''})`
    }
    return instruction
  }).filter(Boolean) || []

  return {
    summary: route.summary || '',
    duration: leg.duration?.text || '',
    distance: leg.distance?.text || '',
    steps,
  }
}

/**
 * Get directions with caching. Properties in the same ~1km area share cached results.
 */
async function getCachedDirections(
  origin: string,
  destLat: number,
  destLng: number,
  mode: 'transit' | 'driving' = 'driving'
): Promise<DirectionsResult | null> {
  const destTileKey = toTileKey(destLat, destLng)

  try {
    // Check cache
    const cached = await prisma.directionsCache.findUnique({
      where: { originQuery_destTileKey_mode: { originQuery: origin, destTileKey, mode } },
    })

    if (cached && Date.now() - cached.lastFetchedAt.getTime() < CACHE_MAX_AGE_MS) {
      console.log(`[places] Cache hit for directions: ${origin} → ${destTileKey} (${mode})`)
      const r = cached.result as any
      // Empty object = null was cached (no route found)
      return r && r.duration ? (r as DirectionsResult) : null
    }
  } catch {
    // Cache read failed — continue to fresh fetch
  }

  // Fresh fetch
  const result = await getDirections(origin, destLat, destLng, mode)

  // Save to cache
  try {
    await prisma.directionsCache.upsert({
      where: { originQuery_destTileKey_mode: { originQuery: origin, destTileKey, mode } },
      create: { originQuery: origin, destTileKey, mode, result: result as any ?? {}, lastFetchedAt: new Date() },
      update: { result: result as any ?? {}, lastFetchedAt: new Date() },
    })
  } catch (err) {
    console.warn('[places] Failed to cache directions:', err)
  }

  return result
}

/**
 * Calculate distance between two points (haversine formula).
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): string {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`
  }
  return `${distance.toFixed(1)} km`
}

function emptyLocationData() {
  return {
    directions: { fromAirport: null, fromTrainStation: null, fromBusStation: null, drivingFromAirport: null, drivingFromTrainStation: null, drivingFromBusStation: null },
  }
}

/**
 * Fetch directions data for a property.
 * Nearby places (parking, supermarkets, restaurants, etc.) are handled
 * by the Recommendations system — this only fetches transport directions.
 */
export async function fetchAllLocationData(lat: number, lng: number, city: string) {
  console.log('[places] Fetching directions for:', { lat, lng, city })

  if (!GOOGLE_MAPS_API_KEY) {
    console.error('[places] GOOGLE_MAPS_API_KEY is empty — skipping location data')
    return emptyLocationData()
  }

  if (!lat || !lng || (lat === 0 && lng === 0)) {
    console.error('[places] Invalid coordinates (lat/lng are 0 or missing) — skipping location data')
    return emptyLocationData()
  }

  // Only fetch directions from main transport hubs
  // All nearby places (parking, supermarkets, etc.) are handled by the Recommendations system
  const airportQuery = `aeropuerto ${city}`
  const trainQuery = `estación de tren ${city}`
  const busQuery = `estación de autobuses ${city}`

  const [airportDriving, trainDriving, busDriving] = await Promise.all([
    getCachedDirections(airportQuery, lat, lng, 'driving').catch(() => null),
    getCachedDirections(trainQuery, lat, lng, 'driving').catch(() => null),
    getCachedDirections(busQuery, lat, lng, 'driving').catch(() => null),
  ])

  return {
    directions: {
      drivingFromAirport: airportDriving,
      drivingFromTrainStation: trainDriving,
      drivingFromBusStation: busDriving,
    },
  }
}
