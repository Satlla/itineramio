/**
 * Google Places API helpers for AI Setup wizard.
 * Fetches nearby POIs, directions, and place details for auto-generated manuals.
 */

// Server-side key (no referer restriction) for Places/Directions API calls.
// Falls back to the public key for backward compatibility.
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

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
    supermarkets: [] as any[],
    restaurants: [] as any[],
    cafes: [] as any[],
    pharmacies: [] as any[],
    attractions: [] as any[],
    parks: [] as any[],
    beaches: [] as any[],
    transitStations: [] as any[],
    parking: [] as any[],
    hospitals: [] as any[],
    atms: [] as any[],
    gasStations: [] as any[],
    gyms: [] as any[],
    laundry: [] as any[],
    shoppingMalls: [] as any[],
    directions: { fromAirport: null, fromTrainStation: null, fromBusStation: null, drivingFromAirport: null, drivingFromTrainStation: null, drivingFromBusStation: null },
  }
}

/**
 * Fetch all location-based data for a property address.
 * Returns categorized nearby places for zone generation.
 */
export async function fetchAllLocationData(lat: number, lng: number, city: string) {
  console.log('[places] Fetching location data for:', { lat, lng, city })

  if (!GOOGLE_MAPS_API_KEY) {
    console.error('[places] GOOGLE_MAPS_API_KEY is empty — skipping location data')
    return emptyLocationData()
  }

  if (!lat || !lng || (lat === 0 && lng === 0)) {
    console.error('[places] Invalid coordinates (lat/lng are 0 or missing) — skipping location data')
    return emptyLocationData()
  }

  const [
    supermarkets,
    restaurants,
    cafes,
    pharmacies,
    attractions,
    parks,
    beaches,
    transitStations,
    parking,
    hospitals,
    atms,
    gasStations,
    gyms,
    laundry,
    shoppingMalls,
  ] = await Promise.all([
    searchNearbyPlaces(lat, lng, 'supermarket', 1500, 5),
    searchNearbyPlaces(lat, lng, 'restaurant', 1000, 5),
    searchNearbyPlaces(lat, lng, 'cafe', 1000, 5),
    searchNearbyPlaces(lat, lng, 'pharmacy', 2000, 3),
    searchNearbyPlaces(lat, lng, 'tourist_attraction', 5000, 8),
    searchNearbyPlaces(lat, lng, 'park', 3000, 5),
    searchNearbyPlaces(lat, lng, 'natural_feature', 10000, 5),
    searchNearbyPlaces(lat, lng, 'transit_station', 1500, 3),
    searchNearbyPlaces(lat, lng, 'parking', 1000, 3),
    searchNearbyPlaces(lat, lng, 'hospital', 5000, 3),
    searchNearbyPlaces(lat, lng, 'atm', 1500, 3),
    searchNearbyPlaces(lat, lng, 'gas_station', 3000, 3),
    searchNearbyPlaces(lat, lng, 'gym', 2000, 3),
    searchNearbyPlaces(lat, lng, 'laundry', 2000, 3),
    searchNearbyPlaces(lat, lng, 'shopping_mall', 5000, 3),
  ])

  console.log('[places] Results:', {
    supermarkets: supermarkets.length,
    restaurants: restaurants.length,
    cafes: cafes.length,
    pharmacies: pharmacies.length,
    attractions: attractions.length,
    parks: parks.length,
    beaches: beaches.length,
    transitStations: transitStations.length,
    parking: parking.length,
    hospitals: hospitals.length,
    atms: atms.length,
    gasStations: gasStations.length,
    gyms: gyms.length,
    laundry: laundry.length,
    shoppingMalls: shoppingMalls.length,
  })

  // Add distance to each place
  const addDistance = (places: NearbyPlace[]) =>
    places.map(p => ({
      ...p,
      distance: calculateDistance(lat, lng, p.lat, p.lng),
    }))

  // Fetch directions from main transport hubs
  const airportQuery = `aeropuerto ${city}`
  const trainQuery = `estación de tren ${city}`
  const busQuery = `estación de autobuses ${city}`

  const [airportTransit, trainTransit, busTransit, airportDriving, trainDriving, busDriving] = await Promise.all([
    getDirections(airportQuery, lat, lng, 'transit').catch(() => null),
    getDirections(trainQuery, lat, lng, 'transit').catch(() => null),
    getDirections(busQuery, lat, lng, 'transit').catch(() => null),
    getDirections(airportQuery, lat, lng, 'driving').catch(() => null),
    getDirections(trainQuery, lat, lng, 'driving').catch(() => null),
    getDirections(busQuery, lat, lng, 'driving').catch(() => null),
  ])

  return {
    supermarkets: addDistance(supermarkets),
    restaurants: addDistance(restaurants),
    cafes: addDistance(cafes),
    pharmacies: addDistance(pharmacies),
    attractions: addDistance(attractions),
    parks: addDistance(parks),
    beaches: addDistance(beaches),
    transitStations: addDistance(transitStations),
    parking: addDistance(parking),
    hospitals: addDistance(hospitals),
    atms: addDistance(atms),
    gasStations: addDistance(gasStations),
    gyms: addDistance(gyms),
    laundry: addDistance(laundry),
    shoppingMalls: addDistance(shoppingMalls),
    directions: {
      fromAirport: airportTransit,
      fromTrainStation: trainTransit,
      fromBusStation: busTransit,
      drivingFromAirport: airportDriving,
      drivingFromTrainStation: trainDriving,
      drivingFromBusStation: busDriving,
    },
  }
}
