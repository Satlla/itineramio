/**
 * Recommendation category definitions.
 * Maps each category to its data source (OSM free / Google Places paid),
 * search parameters, and display metadata.
 */

export type DataSource = 'OSM' | 'GOOGLE'

export interface CategoryConfig {
  id: string
  /** Display name in Spanish */
  label: string
  /** Icon identifier (Lucide icon name) */
  icon: string
  /** Data source: OSM (free) or GOOGLE (paid, curated) */
  source: DataSource
  /** Search radius in meters */
  radius: number
  /** Max results to return */
  maxResults: number
  /** Google Places type (only for source=GOOGLE, searchMode=nearby) */
  googleType?: string
  /** Overpass query tags (only for source=OSM) */
  osmTags?: Record<string, string | string[]>
  /** Search mode: 'nearby' (proximity) or 'text' (curated query) */
  searchMode?: 'nearby' | 'text'
  /** Text query for searchMode=text. Use {city} placeholder for city name. */
  textQuery?: string
  /** Whether to fetch Google Place Details (opening hours, phone, photos). Costs ~$0.017/place. */
  fetchDetails?: boolean
}

/**
 * All supported recommendation categories.
 * OSM = free via Overpass API
 * GOOGLE = paid via Google Places API (used for curated/subjective categories)
 */
export const CATEGORIES: CategoryConfig[] = [
  // --- FREE (OSM/Overpass) — essential services, proximity matters most ---
  {
    id: 'pharmacy',
    label: 'Farmacias',
    icon: 'Pill',
    source: 'OSM',
    radius: 2000,
    maxResults: 5,
    osmTags: { amenity: 'pharmacy' },
    fetchDetails: true, // Need opening hours (guest asks "farmacia abierta domingo")
  },
  {
    id: 'supermarket',
    label: 'Supermercados',
    icon: 'ShoppingCart',
    source: 'OSM',
    radius: 1500,
    maxResults: 5,
    osmTags: { shop: 'supermarket' },
    fetchDetails: true, // Need opening hours (guest asks "super abierto domingo")
  },
  {
    id: 'hospital',
    label: 'Hospitales y urgencias',
    icon: 'Hospital',
    source: 'OSM',
    radius: 5000,
    maxResults: 3,
    osmTags: { amenity: ['hospital', 'clinic'] },
  },
  {
    id: 'atm',
    label: 'Cajeros automáticos',
    icon: 'Banknote',
    source: 'OSM',
    radius: 1500,
    maxResults: 3,
    osmTags: { amenity: 'atm' },
  },
  {
    id: 'gas_station',
    label: 'Gasolineras',
    icon: 'Fuel',
    source: 'OSM',
    radius: 3000,
    maxResults: 3,
    osmTags: { amenity: 'fuel' },
  },
  {
    id: 'gym',
    label: 'Gimnasios',
    icon: 'Dumbbell',
    source: 'OSM',
    radius: 2000,
    maxResults: 3,
    osmTags: { leisure: 'fitness_centre' },
  },
  {
    id: 'laundry',
    label: 'Lavanderías',
    icon: 'WashingMachine',
    source: 'OSM',
    radius: 2000,
    maxResults: 3,
    osmTags: { shop: ['laundry', 'dry_cleaning'] },
  },
  {
    id: 'parking',
    label: 'Aparcamientos',
    icon: 'ParkingCircle',
    source: 'OSM',
    radius: 1000,
    maxResults: 3,
    osmTags: { amenity: 'parking' },
  },
  {
    id: 'transit_station',
    label: 'Transporte público',
    icon: 'Train',
    source: 'OSM',
    radius: 1500,
    maxResults: 3,
    osmTags: { public_transport: 'station' },
  },

  // --- PAID (Google Places) — curated/subjective categories ---
  {
    id: 'restaurant',
    label: 'Restaurantes',
    icon: 'UtensilsCrossed',
    source: 'GOOGLE',
    radius: 1000,
    maxResults: 8,
    searchMode: 'text',
    textQuery: 'mejores restaurantes',
    fetchDetails: true,
  },
  {
    id: 'cafe',
    label: 'Cafeterías',
    icon: 'Coffee',
    source: 'GOOGLE',
    radius: 1000,
    maxResults: 5,
    googleType: 'cafe',
    searchMode: 'nearby',
    fetchDetails: true,
  },
  {
    id: 'tourist_attraction',
    label: 'Qué ver',
    icon: 'Landmark',
    source: 'GOOGLE',
    radius: 5000,
    maxResults: 8,
    searchMode: 'text',
    textQuery: 'monumentos y lugares de interés turístico',
    fetchDetails: true,
  },
  {
    id: 'park',
    label: 'Parques y jardines',
    icon: 'TreePine',
    source: 'GOOGLE',
    radius: 3000,
    maxResults: 5,
    googleType: 'park',
    searchMode: 'nearby',
  },
  {
    id: 'beach',
    label: 'Playas',
    icon: 'Waves',
    source: 'GOOGLE',
    radius: 15000,
    maxResults: 5,
    searchMode: 'text',
    textQuery: 'mejores playas',
  },
  {
    id: 'shopping_mall',
    label: 'Centros comerciales',
    icon: 'Store',
    source: 'GOOGLE',
    radius: 5000,
    maxResults: 3,
    googleType: 'shopping_mall',
    searchMode: 'nearby',
  },
]

/** Average walking speed: 80 meters per minute (~4.8 km/h) */
export const WALK_SPEED_MPM = 80

/** Cache TTL: 30 days in milliseconds */
export const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000

/** Geo-tile precision: 2 decimal places ≈ ~1.1km grid */
export const TILE_PRECISION = 100

export function getCategoryById(id: string): CategoryConfig | undefined {
  return CATEGORIES.find(c => c.id === id)
}

export function getCategoriesBySource(source: DataSource): CategoryConfig[] {
  return CATEGORIES.filter(c => c.source === source)
}

/**
 * Generate a geo-tile key from coordinates.
 * Properties within ~1km of each other share the same tile.
 */
export function geoTileKey(lat: number, lng: number): string {
  return `${Math.round(lat * TILE_PRECISION)}:${Math.round(lng * TILE_PRECISION)}`
}
