/**
 * Google Places API wrapper for curated categories.
 * Supports Nearby Search, Text Search, AI-curated search, plus Place Details.
 */

import { CategoryConfig, WALK_SPEED_MPM } from './categories'

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

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
 * Main search entry point. Routes to the appropriate search mode.
 */
export async function searchGoogle(
  lat: number,
  lng: number,
  category: CategoryConfig,
  city?: string
): Promise<GooglePlace[]> {
  if (!GOOGLE_MAPS_API_KEY) return []

  // AI-curated: Claude picks the best places, then Google Find Place fetches data
  if (category.searchMode === 'ai_curated' && category.aiPrompt && city) {
    return searchAICurated(lat, lng, category, city)
  }

  // Text Search: curated query
  if (category.searchMode === 'text' && category.textQuery) {
    return searchGoogleText(category.textQuery, lat, lng, category)
  }

  // Nearby Search: proximity-based
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
 * AI-curated search: Claude Haiku generates the best places for a category,
 * then Google Find Place fetches real data (place_id, photos, location) for each.
 */
async function searchAICurated(
  lat: number,
  lng: number,
  category: CategoryConfig,
  city: string
): Promise<GooglePlace[]> {
  if (!ANTHROPIC_API_KEY) {
    console.log(`[google] No ANTHROPIC_API_KEY — falling back to text search for ${category.id}`)
    return searchGoogleText(category.label, lat, lng, category)
  }

  const prompt = (category.aiPrompt || '').replace(/\{city\}/g, city)

  console.log(`[google] AI-curated search for ${category.id} in ${city}`)

  try {
    // Step 1: Ask Claude for the best places
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `${prompt}\n\nResponde SOLO con un JSON array de nombres exactos de los lugares. Ejemplo: ["Nombre 1", "Nombre 2", "Nombre 3"]\nUsa los nombres oficiales/completos como aparecen en Google Maps.`,
        }],
      }),
    })

    if (!response.ok) {
      console.error(`[google] Claude API failed for ${category.id}:`, response.status)
      return searchGoogleText(category.label, lat, lng, category)
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''

    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.error(`[google] Could not parse Claude response for ${category.id}:`, text)
      return searchGoogleText(category.label, lat, lng, category)
    }

    const placeNames: string[] = JSON.parse(jsonMatch[0])
    console.log(`[google] Claude suggested ${placeNames.length} places for ${category.id}:`, placeNames)

    // Step 2: For each name, use Google Find Place to get real data
    const places: GooglePlace[] = []
    for (const name of placeNames.slice(0, category.maxResults)) {
      try {
        const place = await findPlaceByName(name, city, lat, lng)
        if (place) {
          places.push(place)
        }
      } catch (err) {
        console.error(`[google] Find place failed for "${name}":`, err)
      }
    }

    // Sort by distance
    places.sort((a, b) => a.distanceMeters - b.distanceMeters)

    console.log(`[google] AI-curated found ${places.length}/${placeNames.length} places for ${category.id}`)
    return places
  } catch (err) {
    console.error(`[google] AI-curated search failed for ${category.id}:`, err)
    return searchGoogleText(category.label, lat, lng, category)
  }
}

/**
 * Find a specific place by name using Google Find Place from Text.
 * Returns full GooglePlace data with distance from origin.
 */
async function findPlaceByName(
  name: string,
  city: string,
  originLat: number,
  originLng: number
): Promise<GooglePlace | null> {
  const query = `${name} ${city}`
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&locationbias=circle:50000@${originLat},${originLng}&fields=place_id,name,formatted_address,geometry,rating,price_level,types,business_status,photos&key=${GOOGLE_MAPS_API_KEY}&language=es`

  const response = await fetch(url)
  if (!response.ok) return null

  const data = await response.json()
  const candidate = data.candidates?.[0]
  if (!candidate) return null

  const placeLat = candidate.geometry?.location?.lat
  const placeLng = candidate.geometry?.location?.lng
  if (!placeLat || !placeLng) return null

  const distanceMeters = haversineMeters(originLat, originLng, placeLat, placeLng)
  const photoRef = candidate.photos?.[0]?.photo_reference
  const photoUrl = photoRef ? buildPhotoUrl(photoRef) : undefined

  return {
    placeId: candidate.place_id,
    name: candidate.name,
    address: candidate.formatted_address || '',
    latitude: placeLat,
    longitude: placeLng,
    rating: candidate.rating,
    priceLevel: candidate.price_level,
    types: candidate.types || [],
    businessStatus: candidate.business_status,
    photoUrl,
    distanceMeters,
    walkMinutes: Math.ceil(distanceMeters / WALK_SPEED_MPM),
  }
}

/**
 * Search using Google Places Text Search (query-based).
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
  const parsed = results.map((place: any) => {
    const placeLat = place.geometry?.location?.lat
    const placeLng = place.geometry?.location?.lng
    const distanceMeters = haversineMeters(lat, lng, placeLat, placeLng)

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

  parsed.sort((a, b) => a.distanceMeters - b.distanceMeters)
  return parsed.slice(0, maxResults)
}

/**
 * Fetch detailed info for a specific place.
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
