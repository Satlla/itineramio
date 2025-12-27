/**
 * Utility functions for generating and handling URL-friendly slugs
 */

// Helper function to get text from multilingual objects
const getText = (value: any, fallback: string = ''): string => {
  if (typeof value === 'string') {
    return value
  }
  if (value && typeof value === 'object') {
    return value.es || value.en || value.fr || fallback
  }
  return fallback
}

/**
 * Converts text to URL-friendly slug
 * @param text - Text to convert to slug
 * @returns URL-friendly slug
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace Spanish characters
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/ü/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/ç/g, 'c')
    // Remove special characters and replace with hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Creates a property slug from property data
 * @param property - Property object with name and potentially city
 * @returns URL-friendly property slug
 */
export function createPropertySlug(property: any): string {
  const name = getText(property.name, 'propiedad')
  const city = getText(property.city, '')
  
  if (city) {
    return createSlug(`${name}-${city}`)
  }
  return createSlug(name)
}

/**
 * Creates a zone slug from zone data
 * @param zone - Zone object with name
 * @returns URL-friendly zone slug
 */
export function createZoneSlug(zone: any): string {
  const name = getText(zone.name, 'zona')
  return createSlug(name)
}

/**
 * Creates full URL path with slugs
 * @param property - Property object
 * @param zone - Zone object (optional)
 * @returns Full URL path with slugs
 */
export function createFriendlyUrl(property: any, zone?: any): string {
  const propertySlug = createPropertySlug(property)
  
  if (zone) {
    const zoneSlug = createZoneSlug(zone)
    return `/properties/${propertySlug}/${zoneSlug}`
  }
  
  return `/properties/${propertySlug}`
}

/**
 * Mapping helpers for converting between IDs and slugs
 */
export interface SlugMap {
  slug: string
  id: string
  name: string
}

/**
 * Creates a mapping of slugs to IDs for properties
 * @param properties - Array of property objects
 * @returns Map of slug to property data
 */
export function createPropertySlugMap(properties: any[]): Map<string, SlugMap> {
  const map = new Map<string, SlugMap>()
  
  properties.forEach(property => {
    const slug = createPropertySlug(property)
    map.set(slug, {
      slug,
      id: property.id,
      name: getText(property.name, 'Propiedad')
    })
  })
  
  return map
}

/**
 * Creates a mapping of slugs to IDs for zones
 * @param zones - Array of zone objects
 * @returns Map of slug to zone data
 */
export function createZoneSlugMap(zones: any[]): Map<string, SlugMap> {
  const map = new Map<string, SlugMap>()
  
  zones.forEach(zone => {
    const slug = createZoneSlug(zone)
    map.set(slug, {
      slug,
      id: zone.id,
      name: getText(zone.name, 'Zona')
    })
  })
  
  return map
}

/**
 * Finds property by slug
 * @param slug - Property slug
 * @param properties - Array of properties to search
 * @returns Property object or null
 */
export function findPropertyBySlug(slug: string, properties: any[]): any {
  return properties.find(property => 
    createPropertySlug(property) === slug
  )
}

/**
 * Finds zone by slug
 * @param slug - Zone slug
 * @param zones - Array of zones to search
 * @returns Zone object or null
 */
export function findZoneBySlug(slug: string, zones: any[]): any {
  return zones.find(zone => 
    createZoneSlug(zone) === slug
  )
}