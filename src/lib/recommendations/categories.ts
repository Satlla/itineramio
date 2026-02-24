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
  /**
   * Search mode:
   * - 'nearby': Google Nearby Search (proximity-based)
   * - 'text': Google Text Search (curated query)
   * - 'ai_curated': Claude generates best places, then Google fetches data
   */
  searchMode?: 'nearby' | 'text' | 'ai_curated'
  /** Text query for searchMode=text. */
  textQuery?: string
  /** AI prompt for searchMode=ai_curated. Use {city} placeholder. */
  aiPrompt?: string
  /** Whether to fetch Google Place Details (opening hours, phone, photos). Costs ~$0.017/place. */
  fetchDetails?: boolean
}

/**
 * All supported recommendation categories.
 * OSM = free via Overpass API (essential services, proximity matters most)
 * GOOGLE = paid via Google Places API
 * ai_curated = Claude picks the best places, Google fetches details
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
    fetchDetails: true,
  },
  {
    id: 'supermarket',
    label: 'Supermercados',
    icon: 'ShoppingCart',
    source: 'OSM',
    radius: 1500,
    maxResults: 5,
    osmTags: { shop: 'supermarket' },
    fetchDetails: true,
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
    source: 'GOOGLE',
    radius: 2000,
    maxResults: 5,
    searchMode: 'text',
    textQuery: 'parking público coches subterráneo',
    fetchDetails: true,
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

  // --- AI-CURATED — Claude picks the best, Google fetches the data ---
  {
    id: 'restaurant',
    label: 'Restaurantes destacados',
    icon: 'UtensilsCrossed',
    source: 'GOOGLE',
    radius: 5000,
    maxResults: 8,
    searchMode: 'ai_curated',
    aiPrompt: 'Los 8 mejores restaurantes de {city} que un turista debe conocer. Incluye restaurantes famosos, con encanto y buena relación calidad-precio. Mezcla alta cocina con locales populares auténticos.',
    fetchDetails: true,
  },
  {
    id: 'cafe',
    label: 'Cafeterías',
    icon: 'Coffee',
    source: 'GOOGLE',
    radius: 3000,
    maxResults: 5,
    searchMode: 'ai_curated',
    aiPrompt: 'Las 5 mejores cafeterías y brunch spots de {city}. Incluye cafeterías de especialidad, con buen ambiente y bien valoradas.',
    fetchDetails: true,
  },
  {
    id: 'tourist_attraction',
    label: 'Qué ver',
    icon: 'Landmark',
    source: 'GOOGLE',
    radius: 10000,
    maxResults: 8,
    searchMode: 'ai_curated',
    aiPrompt: 'Los 8 lugares imprescindibles que ver en {city}: monumentos, miradores, plazas, barrios históricos, museos principales. Solo los más emblemáticos y visitados.',
    fetchDetails: true,
  },
  {
    id: 'park',
    label: 'Parques y jardines',
    icon: 'TreePine',
    source: 'GOOGLE',
    radius: 5000,
    maxResults: 5,
    searchMode: 'ai_curated',
    aiPrompt: 'Los 5 mejores parques y jardines de {city} para pasear, hacer deporte o descansar. Incluye parques urbanos, jardines históricos y espacios naturales cercanos.',
    fetchDetails: true,
  },
  {
    id: 'beach',
    label: 'Playas',
    icon: 'Waves',
    source: 'GOOGLE',
    radius: 50000,
    maxResults: 6,
    searchMode: 'ai_curated',
    aiPrompt: 'Las 6 mejores playas cerca de {city} (hasta 1h en coche). Incluye playas paradisíacas, calas escondidas y playas familiares. Prioriza las más bonitas y recomendadas, no solo las más cercanas.',
    fetchDetails: true,
  },
  {
    id: 'shopping_mall',
    label: 'Centros comerciales',
    icon: 'Store',
    source: 'GOOGLE',
    radius: 15000,
    maxResults: 6,
    searchMode: 'ai_curated',
    aiPrompt: 'Los 6 mejores centros comerciales y zonas de compras de {city} y alrededores. Incluye grandes centros comerciales, outlets, galerías comerciales y centros con más tiendas y mejor valorados. Prioriza los más grandes y visitados.',
    fetchDetails: true,
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
