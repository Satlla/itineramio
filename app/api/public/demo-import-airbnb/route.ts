import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getRateLimitKey } from '../../../../src/lib/rate-limit'

// ============================================
// AIRBNB LISTING SCRAPER — Demo import
// ============================================

const AIRBNB_URL_REGEX = /airbnb\.\w+\/rooms\/(\d+)/
const FETCH_TIMEOUT_MS = 10_000

// Map Airbnb property types to our enum
const PROPERTY_TYPE_MAP: Record<string, 'APARTMENT' | 'HOUSE' | 'VILLA' | 'ROOM'> = {
  // Spanish
  'apartamento': 'APARTMENT',
  'piso': 'APARTMENT',
  'loft': 'APARTMENT',
  'ático': 'APARTMENT',
  'atico': 'APARTMENT',
  'estudio': 'APARTMENT',
  'casa': 'HOUSE',
  'chalet': 'HOUSE',
  'cabaña': 'HOUSE',
  'cabana': 'HOUSE',
  'cottage': 'HOUSE',
  'bungalow': 'HOUSE',
  'townhouse': 'HOUSE',
  'adosado': 'HOUSE',
  'villa': 'VILLA',
  'mansión': 'VILLA',
  'mansion': 'VILLA',
  'habitación': 'ROOM',
  'habitacion': 'ROOM',
  'room': 'ROOM',
  // English
  'apartment': 'APARTMENT',
  'flat': 'APARTMENT',
  'condo': 'APARTMENT',
  'condominium': 'APARTMENT',
  'house': 'HOUSE',
  'cabin': 'HOUSE',
  'home': 'HOUSE',
  'entire home': 'HOUSE',
  'entire rental unit': 'APARTMENT',
  'entire condo': 'APARTMENT',
  'entire loft': 'APARTMENT',
  'entire villa': 'VILLA',
  'private room': 'ROOM',
  'shared room': 'ROOM',
  // French
  'appartement': 'APARTMENT',
  'maison': 'HOUSE',
  'chambre': 'ROOM',
}

// Amenity keywords → boolean flags
const AMENITY_AC_KEYWORDS = [
  'aire acondicionado', 'air conditioning', 'climatisation', 'a/c', 'ac',
  'central air', 'aire central', 'split',
]
const AMENITY_POOL_KEYWORDS = [
  'piscina', 'pool', 'swimming pool', 'alberca',
]
const AMENITY_PARKING_KEYWORDS = [
  'parking', 'aparcamiento', 'garaje', 'garage', 'estacionamiento',
  'plaza de parking', 'free parking', 'parking gratuito',
]

// Check-in method keywords
const CHECKIN_CODE_KEYWORDS = [
  'cerradura inteligente', 'smart lock', 'código', 'code', 'keypad',
  'teclado numérico', 'digital lock', 'cerradura digital', 'serrure intelligente',
  'digicode',
]
const CHECKIN_LOCKBOX_KEYWORDS = [
  'caja de seguridad', 'lockbox', 'key box', 'caja de llaves', 'key safe',
  'boîte à clés', 'cajita',
]
const CHECKIN_INPERSON_KEYWORDS = [
  'en persona', 'in person', 'meet', 'greet', 'recepción', 'reception',
  'portero', 'conserje', 'concierge',
]

function mapPropertyType(raw: string): 'APARTMENT' | 'HOUSE' | 'VILLA' | 'ROOM' {
  const lower = raw.toLowerCase().trim()
  for (const [key, value] of Object.entries(PROPERTY_TYPE_MAP)) {
    if (lower.includes(key)) return value
  }
  return 'APARTMENT' // default
}

// Section headers to ignore (not real amenities)
const AMENITY_SECTION_HEADERS = [
  'aparcamiento e instalaciones', 'parking and facilities',
  'calefacción y refrigeración', 'heating and cooling',
  'cocina y comedor', 'kitchen and dining',
  'internet y oficina', 'internet and office',
  'entretenimiento', 'entertainment',
  'seguridad en el hogar', 'home safety',
  'servicios', 'services',
]

function mapAmenities(amenities: string[]): { hasAC: boolean; hasPool: boolean; hasParking: 'yes' | 'no' | 'nearby' } {
  // Filter out section headers before checking
  const realAmenities = amenities.filter(a =>
    !AMENITY_SECTION_HEADERS.some(h => a.toLowerCase() === h)
  )
  const lower = realAmenities.map(a => a.toLowerCase())
  const hasAC = lower.some(a => AMENITY_AC_KEYWORDS.some(k => a.includes(k)))
  const hasPool = lower.some(a => AMENITY_POOL_KEYWORDS.some(k => a.includes(k)))
  const parkingMatch = lower.some(a => AMENITY_PARKING_KEYWORDS.some(k => a.includes(k)))
  return { hasAC, hasPool, hasParking: parkingMatch ? 'yes' : 'no' }
}

function detectCheckInMethod(amenities: string[], description: string): 'key' | 'lockbox' | 'code' | 'in-person' | null {
  const allText = [...amenities, description].map(s => s.toLowerCase())
  if (allText.some(t => CHECKIN_CODE_KEYWORDS.some(k => t.includes(k)))) return 'code'
  if (allText.some(t => CHECKIN_LOCKBOX_KEYWORDS.some(k => t.includes(k)))) return 'lockbox'
  if (allText.some(t => CHECKIN_INPERSON_KEYWORDS.some(k => t.includes(k)))) return 'in-person'
  return null
}

// Mapping: Airbnb amenity title → Step2Data items key
const AMENITY_TO_ITEM: Record<string, string> = {
  // Iron
  'plancha': 'iron', 'iron': 'iron', 'fer à repasser': 'iron',
  // Ironing board
  'tabla de planchar': 'ironingBoard', 'ironing board': 'ironingBoard', 'table à repasser': 'ironingBoard',
  // Hairdryer
  'secador de pelo': 'hairdryer', 'secador': 'hairdryer', 'hair dryer': 'hairdryer',
  'hairdryer': 'hairdryer', 'sèche-cheveux': 'hairdryer',
  // First aid
  'botiquín': 'firstAid', 'botiquin': 'firstAid', 'first aid kit': 'firstAid',
  'first aid': 'firstAid', 'trousse de secours': 'firstAid',
  // Extra blankets
  'mantas extra': 'extraBlankets', 'extra blankets': 'extraBlankets',
  'mantas adicionales': 'extraBlankets', 'extra pillows and blankets': 'extraBlankets',
  'almohadas y mantas extra': 'extraBlankets',
  // Broom
  'escoba': 'broom', 'broom': 'broom', 'balai': 'broom',
}

interface HouseRules {
  noPets: boolean
  noSmoking: boolean
  noParties: boolean
  quietHoursStart: string  // e.g. "23:00"
  quietHoursEnd: string    // e.g. "8:00"
  additionalRules: string
  noParking: boolean
}

interface ScrapedData {
  propertyName: string
  propertyDescription: string
  profileImage: string
  lat: number | null
  lng: number | null
  city: string
  country: string
  formattedAddress: string
  propertyType: 'APARTMENT' | 'HOUSE' | 'VILLA' | 'ROOM'
  maxGuests: number
  bedrooms: number
  bathrooms: number
  hasAC: boolean
  hasPool: boolean
  hasParking: 'yes' | 'no' | 'nearby'
  checkInMethod: 'key' | 'lockbox' | 'code' | 'in-person' | null
  checkInTime: string
  checkOutTime: string
  amenities: string[]
  allAmenities: string[]  // Full list of ALL amenities for chatbot
  photos: string[]
  // Host info
  hostName: string
  isSuperhost: boolean
  // House rules
  houseRules: HouseRules
  // Checkout tasks
  checkoutTasks: string[]
  // Pre-mapped items for Step2Data
  items: {
    iron: boolean
    ironingBoard: boolean
    hairdryer: boolean
    firstAid: boolean
    extraBlankets: boolean
    broom: boolean
  }
}

async function scrapeAirbnbListing(listingId: string): Promise<ScrapedData> {
  const url = `https://www.airbnb.es/rooms/${listingId}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
      },
    })

    if (!res.ok) {
      throw new Error(`Airbnb returned ${res.status}`)
    }

    const html = await res.text()
    return parseAirbnbHtml(html)
  } finally {
    clearTimeout(timeout)
  }
}

// Filter out Airbnb platform assets, user profile pics, etc.
function isListingPhoto(url: string): boolean {
  // Platform UI assets
  if (url.includes('airbnb-platform-assets')) return false
  if (url.includes('AirbnbPlatformAssets')) return false
  if (url.includes('search-bar-icons')) return false
  if (url.includes('Favicons')) return false
  // User profile photos
  if (url.includes('/user/User/')) return false
  if (url.includes('/user/User-')) return false
  if (url.match(/\/pictures\/user\//)) return false
  // PNGs that are NOT hosting (floor plans etc.)
  if (url.endsWith('.png') && !url.includes('Hosting')) return false
  // Must be a listing photo (miso/Hosting- or hosting/Hosting-)
  return true
}

// Extract country name from code
const COUNTRY_CODE_MAP: Record<string, string> = {
  'ES': 'España', 'FR': 'Francia', 'IT': 'Italia', 'PT': 'Portugal',
  'DE': 'Alemania', 'GB': 'Reino Unido', 'US': 'Estados Unidos',
  'MX': 'México', 'AR': 'Argentina', 'CO': 'Colombia', 'CL': 'Chile',
  'GR': 'Grecia', 'HR': 'Croacia', 'NL': 'Países Bajos', 'BE': 'Bélgica',
}

function parseAirbnbHtml(html: string): ScrapedData {
  const result: ScrapedData = {
    propertyName: '',
    propertyDescription: '',
    profileImage: '',
    lat: null,
    lng: null,
    city: '',
    country: '',
    formattedAddress: '',
    propertyType: 'APARTMENT',
    maxGuests: 0,
    bedrooms: 0,
    bathrooms: 0,
    hasAC: false,
    hasPool: false,
    hasParking: 'no',
    checkInMethod: null,
    checkInTime: '',
    checkOutTime: '',
    amenities: [],
    allAmenities: [],
    photos: [],
    hostName: '',
    isSuperhost: false,
    houseRules: {
      noPets: false,
      noSmoking: false,
      noParties: false,
      quietHoursStart: '',
      quietHoursEnd: '',
      additionalRules: '',
      noParking: false,
    },
    checkoutTasks: [],
    items: {
      iron: false,
      ironingBoard: false,
      hairdryer: false,
      firstAid: false,
      extraBlankets: false,
      broom: false,
    },
  }

  // ── 1. Extract from JSON embedded in HTML (most data lives here) ──
  // Airbnb embeds listing data as "listingTitle", "personCapacity", etc.
  // We search the entire HTML as a string — works regardless of JSON structure

  // Title: prefer "listingTitle" (the actual listing name)
  const listingTitleMatch = html.match(/"listingTitle"\s*:\s*"([^"]+)"/i)
  if (listingTitleMatch) {
    result.propertyName = decodeHtmlEntities(listingTitleMatch[1])
  }

  // Description: from JSON "description" field
  const descMatch = html.match(/"description"\s*:\s*"([^"]{10,500})"/i)
  if (descMatch) {
    result.propertyDescription = decodeHtmlEntities(descMatch[1])
  }

  // Person capacity (maxGuests)
  const capacityMatch = html.match(/"personCapacity"\s*:\s*(\d+)/i)
  if (capacityMatch) {
    result.maxGuests = parseInt(capacityMatch[1], 10)
  }

  // Coordinates
  const latMatch = html.match(/"lat(?:itude)?"\s*:\s*(-?\d+\.\d+)/i)
  const lngMatch = html.match(/"l(?:ng|on|ongitude)"\s*:\s*(-?\d+\.\d+)/i)
  if (latMatch && lngMatch) {
    result.lat = parseFloat(latMatch[1])
    result.lng = parseFloat(lngMatch[1])
  }

  // City
  const cityMatch = html.match(/"city"\s*:\s*"([^"]+)"/i)
  if (cityMatch) result.city = decodeHtmlEntities(cityMatch[1])

  // Country
  const countryMatch = html.match(/"country"\s*:\s*"([^"]+)"/i)
  if (countryMatch) {
    const rawCountry = decodeHtmlEntities(countryMatch[1])
    // Convert country codes to names
    result.country = COUNTRY_CODE_MAP[rawCountry] || rawCountry
  }

  // Property type: "propertyType":"Alojamiento entero: loft"
  const propTypeMatch = html.match(/"propertyType"\s*:\s*"([^"]+)"/i)
  if (propTypeMatch) {
    result.propertyType = mapPropertyType(propTypeMatch[1])
  } else {
    const roomTypeMatch = html.match(/"roomTypeCategory"\s*:\s*"([^"]+)"/i)
    if (roomTypeMatch) {
      result.propertyType = mapPropertyType(roomTypeMatch[1])
    }
  }

  // Bedrooms & bathrooms from overview text in og:title or HTML
  // og:title format: "Loft · Alicante · ★4,79 · 1 dormitorio · 2 camas · 1 baño"
  const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)?.[1]
    || html.match(/<meta\s+content="([^"]+)"\s+property="og:title"/i)?.[1]
    || ''

  if (result.bedrooms === 0) {
    const bedroomMatch = ogTitle.match(/(\d+)\s*(?:dormitorio|bedroom|chambre)/i)
      || html.match(/(\d+)\s*(?:dormitorio|bedroom|chambre)/i)
    if (bedroomMatch) result.bedrooms = parseInt(bedroomMatch[1], 10)
  }

  if (result.bathrooms === 0) {
    const bathroomMatch = ogTitle.match(/(\d+)\s*(?:baño|bathroom|salle de bain)/i)
      || html.match(/(\d+)\s*(?:baño|bathroom|salle de bain)/i)
    if (bathroomMatch) result.bathrooms = parseInt(bathroomMatch[1], 10)
  }

  if (result.maxGuests === 0) {
    const guestMatch = ogTitle.match(/(\d+)\s*(?:huéspedes?|guests?|voyageurs?)/i)
      || html.match(/(\d+)\s*(?:huéspedes?|guests?|voyageurs?)/i)
    if (guestMatch) result.maxGuests = parseInt(guestMatch[1], 10)
  }

  // ── 2. Fallback: extract name from <title> or og:description ──
  // In Airbnb: og:description = listing name, og:title = overview metadata
  if (!result.propertyName) {
    const ogDesc = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i)?.[1]
      || html.match(/<meta\s+content="([^"]+)"\s+property="og:description"/i)?.[1]
    if (ogDesc) {
      result.propertyName = decodeHtmlEntities(ogDesc)
    }
  }

  if (!result.propertyName) {
    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleTag) {
      // "The Nook Terrace - Lofts en alquiler en Alicante, ... - Airbnb"
      const cleaned = decodeHtmlEntities(titleTag[1])
        .replace(/\s*[-–—]\s*(Lofts?|Pisos?|Casas?|Apartamentos?|Villas?|Rooms?|Entire|Private)\s.*$/i, '')
        .replace(/\s*[-–—]\s*Airbnb.*$/i, '')
        .trim()
      result.propertyName = cleaned
    }
  }

  // ── 3. Extract listing photos (filter platform assets) ──
  if (result.photos.length === 0) {
    // Match any a0-a9.muscache.com subdomain (Airbnb uses multiple CDN shards)
    const photoMatches = html.matchAll(/https:(?:\\\/\\\/|\/\/)a\d+\.muscache\.com\/(?:im\/)?pictures\/[^"'\s)]+/g)
    const uniquePhotos = new Set<string>()
    for (const match of photoMatches) {
      let photoUrl = match[0]
      // Decode JSON-escaped slashes (\/ → /) and strip query params
      photoUrl = photoUrl.replace(/\\\//g, '/').replace(/\?.*$/, '')
      if (isListingPhoto(photoUrl)) {
        uniquePhotos.add(photoUrl)
      }
    }
    result.photos = [...uniquePhotos].slice(0, 20)
  }

  // ── 4. Extract ALL amenities from "title" fields in JSON ──
  // Collect ALL "title" values that look like amenities (2-80 chars, not HTML, not section headers)
  {
    const allTitles = new Set<string>()
    const titleMatches = html.matchAll(/"title"\s*:\s*"([^"]{2,80})"/gi)
    // Known non-amenity junk patterns to filter
    const junkPatterns = [
      /^(Mostrar|Ver\s+todo|Show|See\s+all|Siguiente|Next|Anterior|Previous|Guardar|Save|Reservar|Book)/i,
      // "Cerrar" as nav button but NOT "Cerrar con llave" (checkout task)
      /^Cerrar(?!\s+(?:con|la\s+puerta|las?\s+ventanas?))/i,
      /^Close(?!\s+(?:the\s+)?(?:door|window))/i,
      /^(Barcelona|Madrid|Málaga|Valencia|Palma|Marbella|Granada|Sevilla|Costa\s)/i,
      /^(Alquileres?\s|Alojamientos?\s|Apartamentos?\s|Casas?\s+en\s)/i,
      /^(Descubre\s|Explora\s|Más\s+inform|Qué\s+debes|Cómo\s+funciona)/i,
      /^(Más\s+relevantes|Más\s+recientes|Las\s+mejores|Las\s+peores)/i,
      /^(Llegada\s+y\s+salida|Durante\s+tu|Otras\s+normas|Antes\s+de\s+irte)/i,
      /^(Recomendaciones\s+de|Dispositivos\s+de|Información\s+de)/i,
      /^(Nací\s+en|Estudié\s+en|Empresa|Este\s+anuncio)/i,
      /^\d[\d,.]+\s*(·|evaluacion)/i,  // "4,74 · 87 evaluaciones"
      /^¿(Dónde|Cómo)/i,
      // UI elements and page structure
      /^(El\s+espacio|Datos\s+del|Acerca\s+de|Selecciona\s|Borrar\s|Continuar|Compartir)/i,
      /^(Ruta\s+fotográfica|Animales\s+de|¿Qué\s+debes)/i,
      /^(\d+\s+(cama|baño|dormitorio|bed|bath))/i, // "1 cama", "1 baño"
      /^(Política\s+de|Selecciona\s+una)/i,
      /^(Guardado|Fotos\s+adicionales|No\s+incluidos|Fotos|Comodidades|Evaluaciones|Ubicación)$/i,
      /^(Adultos|Niños|Bebés|Adults|Children|Infants)$/i,
      /^(Airbnb|España|France|Italy|Germany)$/i,
      /^(Se\s+ha\s+traducido|Parte\s+de\s+la\s+información)/i,
      /^(Trabajo:\s|¿Qué\s+hay\s+en)/i,
      /^\d[\d,.]*$/,  // Just numbers like "4,74"
      /^\d+\s+viajeros?$/i, // "2 viajeros"
      /^\d+\s+años?\s+de\s+experiencia$/i,
    ]
    for (const match of titleMatches) {
      const name = decodeHtmlEntities(match[1]).trim()
      // Skip section headers
      if (AMENITY_SECTION_HEADERS.some(h => name.toLowerCase() === h)) continue
      // Skip HTML, numbers only
      if (name.includes('<') || name.includes('>')) continue
      if (/^\d+$/.test(name)) continue
      // Skip known non-amenity junk
      if (junkPatterns.some(p => p.test(name))) continue
      allTitles.add(name)
    }
    result.allAmenities = [...allTitles]
  }

  // ── 5. Filter known amenities for boolean flags ──
  // Build the filtered amenities list (known keywords only) for backwards compat
  {
    const knownAmenityKeywords = [
      'wifi', 'cocina', 'kitchen', 'aire', 'air conditioning', 'climatisation',
      'piscina', 'pool', 'parking', 'aparcamiento', 'garaje',
      'lavadora', 'washer', 'secadora', 'dryer', 'calefacción', 'heating',
      'televisión', 'tv', 'plancha', 'iron', 'ascensor', 'elevator',
      'microondas', 'horno', 'oven', 'lavavajillas', 'dishwasher',
      'balcón', 'terraza', 'patio', 'jardín', 'barbacoa', 'jacuzzi',
      'cerradura', 'lock', 'caja de seguridad', 'lockbox',
      'cafetera', 'coffee', 'nevera', 'congelador', 'hervidor',
      'secador', 'detector', 'agua caliente', 'ropa de cama',
      'llegada autónoma', 'self check-in',
      'tostadora', 'toaster', 'batidora', 'blender',
      'vajilla', 'utensilios', 'sábanas', 'toallas', 'towels',
      'cuna', 'crib', 'trona', 'high chair',
      'zona de trabajo', 'workspace', 'escritorio', 'desk',
    ]
    for (const name of result.allAmenities) {
      if (knownAmenityKeywords.some(k => name.toLowerCase().includes(k))) {
        result.amenities.push(name)
      }
    }
  }

  // Map amenities to boolean flags
  if (result.amenities.length > 0) {
    const flags = mapAmenities(result.amenities)
    result.hasAC = flags.hasAC
    result.hasPool = flags.hasPool
    result.hasParking = flags.hasParking
  }

  // ── 6. Map amenities to Step2Data items ──
  {
    const lowerAmenities = result.allAmenities.map(a => a.toLowerCase())
    for (const amenity of lowerAmenities) {
      for (const [keyword, itemKey] of Object.entries(AMENITY_TO_ITEM)) {
        if (amenity.includes(keyword)) {
          (result.items as any)[itemKey] = true
        }
      }
    }
  }

  // ── 7. Detect check-in method ──
  const checkIn = detectCheckInMethod(result.amenities, result.propertyDescription)
  if (checkIn) result.checkInMethod = checkIn

  // ── 8. Extract check-in/out times from house rules ──
  const checkInTimeMatch = html.match(/Llegada a partir de las (\d{1,2}:\d{2})/i)
    || html.match(/Check.?in.*?(\d{1,2}:\d{2})/i)
    || html.match(/Arriv(?:ée?|al).*?(\d{1,2}:\d{2})/i)
  if (checkInTimeMatch) {
    result.checkInTime = checkInTimeMatch[1]
  }

  const checkOutTimeMatch = html.match(/Salida antes de las (\d{1,2}:\d{2})/i)
    || html.match(/Check.?out.*?(\d{1,2}:\d{2})/i)
    || html.match(/Départ.*?(\d{1,2}:\d{2})/i)
  if (checkOutTimeMatch) {
    result.checkOutTime = checkOutTimeMatch[1]
  }

  // ── 9. Extract host info ──
  // Host name from JSON fields (NOT "hostName" which is the site hostname)
  const hostFirstName = html.match(/"firstName"\s*:\s*"([^"]+)"/i)
    || html.match(/"smartName"\s*:\s*"([^"]+)"/i)
    || html.match(/"displayName"\s*:\s*"([^"]+)"/i)
    || html.match(/Anfitri[oó]n:\s*([A-ZÀ-ÿa-z][a-záéíóúñü]+)/i)
    || html.match(/Hosted by\s+([A-Z][a-z]+)/i)
  if (hostFirstName) {
    result.hostName = decodeHtmlEntities(hostFirstName[1]).trim()
  }

  // Superhost
  result.isSuperhost = /superhost|superanfitri[oó]n|superhôte/i.test(html)

  // ── 10. Extract house rules ──
  // No pets
  result.houseRules.noPets = /no\s+(?:se\s+)?(?:permiten?|admiten?)\s+mascotas|no\s+pets|animaux\s+non/i.test(html)
  // No smoking
  result.houseRules.noSmoking = /no\s+(?:se\s+puede\s+)?fumar|prohibido\s+fumar|no\s+smoking|non[- ]fumeur/i.test(html)
  // No parties
  result.houseRules.noParties = /no\s+(?:se\s+)?permiten?\s+fiestas|no\s+parties|fêtes\s+interdites/i.test(html)
  // Quiet hours: "Silencio de 23:00 a 8:00" or "horario de silencio"
  const quietMatch = html.match(/(?:silencio|quiet\s+hours?).*?(\d{1,2}:\d{2}).*?(\d{1,2}:\d{2})/i)
  if (quietMatch) {
    result.houseRules.quietHoursStart = quietMatch[1]
    result.houseRules.quietHoursEnd = quietMatch[2]
  } else if (/horas\s+de\s+silencio|quiet\s+hours|heures\s+de\s+silence/i.test(html)) {
    // Has quiet hours rule but specific times not found — mark as present
    result.houseRules.quietHoursStart = 'yes'
    result.houseRules.quietHoursEnd = ''
  }
  // No parking from house rules (overrides amenity-based detection)
  if (/no\s+(?:se\s+puede\s+)?aparcar|no\s+parking\s+(?:on|at|available)/i.test(html)) {
    result.houseRules.noParking = true
    result.hasParking = 'no'
  }
  // Additional rules text (the free-form rules paragraph)
  const additionalRulesMatch = html.match(/"additionalRules"\s*:\s*"([^"]{5,2000})"/i)
  if (additionalRulesMatch) {
    result.houseRules.additionalRules = decodeHtmlEntities(additionalRulesMatch[1]).trim()
  }

  // ── 11. Extract checkout tasks ──
  // Airbnb lists these as "checkoutTask" or in the "Tareas de salida" section
  const checkoutTaskMatches = html.matchAll(/"checkoutTask"\s*:\s*"([^"]+)"/gi)
  for (const match of checkoutTaskMatches) {
    const task = decodeHtmlEntities(match[1]).trim()
    if (!result.checkoutTasks.includes(task)) {
      result.checkoutTasks.push(task)
    }
  }
  // Fallback: find checkout tasks from allAmenities titles (they appear after "Antes de irte")
  if (result.checkoutTasks.length === 0) {
    const taskPatterns = [
      /tirar\s+la\s+basura/i, /take\s+out.*trash/i, /sortir.*poubelle/i,
      /apagar\s+las\s+luces/i, /apagar.*electrodom/i, /turn\s+off.*light/i,
      /cerrar.*con\s+llave/i, /cerrar\s+la\s+puerta/i, /lock.*door/i,
      /dejar\s+las\s+llaves/i, /return.*key/i,
      /dejar\s+las\s+toallas/i, /leave.*towel/i,
      /poner.*lavavajillas/i, /run.*dishwasher/i,
      /cerrar\s+las\s+ventanas/i, /close.*window/i,
    ]
    // Search in allAmenities for full task titles
    for (const title of result.allAmenities) {
      if (taskPatterns.some(p => p.test(title))) {
        result.checkoutTasks.push(title)
      }
    }
  }

  // ── 12. Extract profile image (first pictureUrl = listing main photo) ──
  const pictureUrlMatch = html.match(/"pictureUrl"\s*:\s*"([^"]+muscache\.com[^"]+)"/i)
  if (pictureUrlMatch) {
    result.profileImage = decodeHtmlEntities(pictureUrlMatch[1]).replace(/\\\//g, '/')
  }
  // Fallback: use first listing photo if profileImage is still empty
  if (!result.profileImage && result.photos.length > 0) {
    result.profileImage = result.photos[0]
  }

  // ── 14. Build formatted address ──
  // <title> format: "Name - Apartamentos en alquiler en Alicante, Comunidad Valenciana, España - Airbnb"
  const titleForAddress = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || ''
  // Match "en alquiler en City, State, Country - Airbnb"
  const addressFromTitle = titleForAddress.match(/en alquiler en\s+(.+?)\s*[-–—]\s*Airbnb/i)
    || titleForAddress.match(/for rent in\s+(.+?)\s*[-–—]\s*Airbnb/i)
    || titleForAddress.match(/à louer à\s+(.+?)\s*[-–—]\s*Airbnb/i)
  if (addressFromTitle) {
    const fullAddress = decodeHtmlEntities(addressFromTitle[1]).trim()
    result.formattedAddress = fullAddress
    const addressParts = fullAddress.split(',').map(s => s.trim())
    // Title address is more reliable than JSON for city/country
    if (addressParts.length >= 2) {
      result.city = addressParts[0]
      result.country = addressParts[addressParts.length - 1]
    }
  }
  // Fallback: build from city + country
  if (!result.formattedAddress && (result.city || result.country)) {
    result.formattedAddress = [result.city, result.country].filter(Boolean).join(', ')
  }

  return result
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/\\u[\dA-Fa-f]{4}/g, (match) =>
      String.fromCharCode(parseInt(match.replace('\\u', ''), 16))
    )
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\//g, '/')  // JSON-escaped forward slashes in URLs
}

// Wrap an Airbnb image URL through our proxy route
// Airbnb blocks hotlinking (checks Referer) — proxy adds the correct headers
function buildProxyUrl(imageUrl: string, requestUrl: string): string {
  const base = new URL(requestUrl)
  return `${base.protocol}//${base.host}/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
}

// ============================================
// ROUTE HANDLER
// ============================================

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 imports/IP/hour
    const rateLimitKey = getRateLimitKey(request, null, 'airbnb-import')
    const rateCheck = checkRateLimit(rateLimitKey, {
      maxRequests: 5,
      windowMs: 60 * 60 * 1000,
    })
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Demasiados intentos. Inténtalo de nuevo en una hora.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL requerida' },
        { status: 400 }
      )
    }

    // Validate URL format
    const match = url.match(AIRBNB_URL_REGEX)
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'URL de Airbnb no válida. Usa un enlace como: airbnb.es/rooms/12345' },
        { status: 400 }
      )
    }

    const listingId = match[1]

    // Scrape the listing
    const data = await scrapeAirbnbListing(listingId)

    // Validate we got at least some useful data
    if (data.propertyName === '404 Page Not Found' || data.propertyName.includes('Page Not Found')) {
      return NextResponse.json(
        { success: false, error: 'El anuncio no existe o ha sido eliminado. Verifica el enlace.' },
        { status: 404 }
      )
    }
    if (!data.propertyName && !data.lat && data.photos.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No pudimos acceder al anuncio. Puede que sea privado o que Airbnb haya bloqueado la solicitud. Rellena los datos manualmente.' },
        { status: 422 }
      )
    }

    // Route the cover photo through our proxy to avoid Airbnb hotlink blocking
    if (data.profileImage) {
      data.profileImage = buildProxyUrl(data.profileImage, request.url)
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: 'El anuncio tardó demasiado en cargar. Inténtalo de nuevo.' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'No pudimos acceder al anuncio. Rellena los datos manualmente.' },
      { status: 500 }
    )
  }
}
