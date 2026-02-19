/**
 * Google Places API wrapper for curated categories.
 * Supports both Nearby Search and Text Search, plus Place Details
 * for opening hours, photos, phone, and website.
 */

import { CategoryConfig, WALK_SPEED_MPM } from './categories'

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

export interface GooglePlace {
  placeId: string
  name: string
  address: string
  latitude: number
  longitude: number
  rating?: number
  priceLevel?: number
  types: string[]
  businessStatus?: string
  phone?: string
  website?: string
  photoUrl?: string
  openingHours?: string[]
  distanceMeters: number
  walkMinutes: number
}

export interface GooglePlaceDetails {
  phone?: string
  website?: string
  openingHours?: string[]
  photoUrl?: string
  rating?: number
  priceLevel?: number
}

/**
 * Calculate haversine distance between two points in meters.
 */
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

/**
 * Build a Google Places photo URL from a photo_reference.
 */
function buildPhotoUrl(photoReference: string, maxWidth: number = 400): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`
}

/**
 * Search using Google Places Nearby Search (proximity-based).
 */
export async function searchGoogle(
  lat: number,
  lng: number,
  category: CategoryConfig
): Promise<GooglePlace[]> {
  if (!GOOGLE_MAPS_API_KEY) return []

  // Use Text Search or Nearby Search based on category config
  if (category.searchMode === 'text' && category.textQuery) {
    return searchGoogleText(category.textQuery, lat, lng, category)
  }

  if (!category.googleType) return []

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${category.radius}&type=${category.googleType}&key=${GOOGLE_MAPS_API_KEY}&language=es`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`[google] Nearby search failed for ${category.id}:`, response.status)
      return []
    }

    const data = await response.json()
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error(`[google] API error for ${category.id}:`, data.status, data.error_message)
      return []
    }

    return parseGoogleResults(data.results || [], lat, lng, category.maxResults)
  } catch (error) {
    console.error(`[google] Error fetching ${category.id}:`, error)
    return []
  }
}

/**
 * Search using Google Places Text Search (query-based, better curation).
 * Used for beaches, attractions, restaurants where quality > proximity.
 */
async function searchGoogleText(
  query: string,
  lat: number,
  lng: number,
  category: CategoryConfig
): Promise<GooglePlace[]> {
  if (!GOOGLE_MAPS_API_KEY) return []

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=${category.radius}&key=${GOOGLE_MAPS_API_KEY}&language=es`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`[google] Text search failed for ${category.id}:`, response.status)
      return []
    }

    const data = await response.json()
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error(`[google] Text search API error for ${category.id}:`, data.status, data.error_message)
      return []
    }

    return parseGoogleResults(data.results || [], lat, lng, category.maxResults)
  } catch (error) {
    console.error(`[google] Text search error for ${category.id}:`, error)
    return []
  }
}

/**
 * Parse Google Places API results into our GooglePlace format.
 */
function parseGoogleResults(
  results: any[],
  lat: number,
  lng: number,
  maxResults: number
): GooglePlace[] {
  return results.slice(0, maxResults).map((place: any) => {
    const placeLat = place.geometry?.location?.lat
    const placeLng = place.geometry?.location?.lng
    const distanceMeters = haversineMeters(lat, lng, placeLat, placeLng)

    // Get first photo reference if available
    const photoRef = place.photos?.[0]?.photo_reference
    const photoUrl = photoRef ? buildPhotoUrl(photoRef) : undefined

    return {
      placeId: place.place_id,
      name: place.name,
      address: place.vicinity || place.formatted_address || '',
      latitude: placeLat,
      longitude: placeLng,
      rating: place.rating,
      priceLevel: place.price_level,
      types: place.types || [],
      businessStatus: place.business_status,
      photoUrl,
      distanceMeters,
      walkMinutes: Math.ceil(distanceMeters / WALK_SPEED_MPM),
    }
  })
}

/**
 * Fetch detailed info for a specific place: opening hours, phone, website, photo.
 * Called for categories where details matter (supermarkets, pharmacies, restaurants).
 */
export async function fetchPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
  if (!GOOGLE_MAPS_API_KEY || !placeId) return null

  const fields = 'formatted_phone_number,website,opening_hours,rating,price_level,photos'
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_MAPS_API_KEY}&language=es`

  try {
    const response = await fetch(url)
    if (!response.ok) return null

    const data = await response.json()
    if (data.status !== 'OK') return null

    const result = data.result
    const photoRef = result.photos?.[0]?.photo_reference
    const photoUrl = photoRef ? buildPhotoUrl(photoRef) : undefined

    return {
      phone: result.formatted_phone_number,
      website: result.website,
      openingHours: result.opening_hours?.weekday_text,
      photoUrl,
      rating: result.rating,
      priceLevel: result.price_level,
    }
  } catch {
    return null
  }
}
