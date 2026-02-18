/**
 * OpenStreetMap / Overpass API service for free nearby place searches.
 * Used for objective categories (pharmacies, supermarkets, hospitals, etc.)
 */

import { CategoryConfig, WALK_SPEED_MPM } from './categories'

const OVERPASS_API = 'https://overpass-api.de/api/interpreter'

export interface OsmPlace {
  osmId: string
  name: string
  address: string
  latitude: number
  longitude: number
  tags: Record<string, string>
  distanceMeters: number
  walkMinutes: number
}

/**
 * Build Overpass QL query for a category around given coordinates.
 */
function buildOverpassQuery(
  lat: number,
  lng: number,
  category: CategoryConfig
): string {
  if (!category.osmTags) return ''

  const radius = category.radius
  const filters: string[] = []

  for (const [key, value] of Object.entries(category.osmTags)) {
    if (Array.isArray(value)) {
      // Multiple values: amenity~"hospital|clinic"
      const regex = value.join('|')
      filters.push(`["${key}"~"${regex}"]`)
    } else {
      filters.push(`["${key}"="${value}"]`)
    }
  }

  const filterStr = filters.join('')

  // Query nodes and ways, output center for ways
  return `
[out:json][timeout:10];
(
  node${filterStr}(around:${radius},${lat},${lng});
  way${filterStr}(around:${radius},${lat},${lng});
);
out center ${category.maxResults * 2};
`.trim()
}

/**
 * Calculate haversine distance between two points in meters.
 */
function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000 // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

/**
 * Build a readable address from OSM tags.
 */
function buildAddress(tags: Record<string, string>): string {
  const parts = [
    tags['addr:street'],
    tags['addr:housenumber'],
    tags['addr:city'],
  ].filter(Boolean)
  return parts.join(', ') || tags['name'] || ''
}

/**
 * Search for nearby places using the Overpass API.
 */
export async function searchOsm(
  lat: number,
  lng: number,
  category: CategoryConfig
): Promise<OsmPlace[]> {
  if (!category.osmTags) return []

  const query = buildOverpassQuery(lat, lng, category)

  try {
    const response = await fetch(OVERPASS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    })

    if (!response.ok) {
      console.error(`[osm] Overpass API error for ${category.id}:`, response.status)
      return []
    }

    const data = await response.json()
    const elements = data.elements || []

    const places: OsmPlace[] = elements
      .map((el: any) => {
        // For ways, use center coordinates
        const elLat = el.lat ?? el.center?.lat
        const elLng = el.lon ?? el.center?.lon
        if (!elLat || !elLng) return null

        const tags = el.tags || {}
        const name = tags.name || tags.brand || ''
        if (!name) return null // Skip unnamed places

        const distanceMeters = haversineMeters(lat, lng, elLat, elLng)
        const walkMinutes = Math.ceil(distanceMeters / WALK_SPEED_MPM)

        return {
          osmId: `${el.type}/${el.id}`,
          name,
          address: buildAddress(tags),
          latitude: elLat,
          longitude: elLng,
          tags,
          distanceMeters,
          walkMinutes,
        }
      })
      .filter(Boolean) as OsmPlace[]

    // Sort by distance and limit
    places.sort((a, b) => a.distanceMeters - b.distanceMeters)
    return places.slice(0, category.maxResults)
  } catch (error) {
    console.error(`[osm] Error fetching ${category.id}:`, error)
    return []
  }
}
