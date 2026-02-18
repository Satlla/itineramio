/**
 * Google Places API wrapper for curated categories.
 * Used for subjective categories (restaurants, cafes, attractions)
 * where ratings and reviews matter.
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
  distanceMeters: number
  walkMinutes: number
}

export interface GooglePlaceDetails {
  phone?: string
  website?: string
  openingHours?: string[]
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
 * Search for nearby places using Google Places Nearby Search.
 */
export async function searchGoogle(
  lat: number,
  lng: number,
  category: CategoryConfig
): Promise<GooglePlace[]> {
  if (!category.googleType || !GOOGLE_MAPS_API_KEY) return []

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

    const results = (data.results || []).slice(0, category.maxResults)

    return results.map((place: any) => {
      const placeLat = place.geometry?.location?.lat
      const placeLng = place.geometry?.location?.lng
      const distanceMeters = haversineMeters(lat, lng, placeLat, placeLng)

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
        distanceMeters,
        walkMinutes: Math.ceil(distanceMeters / WALK_SPEED_MPM),
      }
    })
  } catch (error) {
    console.error(`[google] Error fetching ${category.id}:`, error)
    return []
  }
}

/**
 * Fetch detailed info for a specific place (phone, hours, etc.)
 * Only called lazily on publish/first render to save costs.
 */
export async function fetchPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
  if (!GOOGLE_MAPS_API_KEY) return null

  const fields = 'formatted_phone_number,website,opening_hours,rating,price_level'
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_MAPS_API_KEY}&language=es`

  try {
    const response = await fetch(url)
    if (!response.ok) return null

    const data = await response.json()
    if (data.status !== 'OK') return null

    const result = data.result
    return {
      phone: result.formatted_phone_number,
      website: result.website,
      openingHours: result.opening_hours?.weekday_text,
      rating: result.rating,
      priceLevel: result.price_level,
    }
  } catch {
    return null
  }
}
