/**
 * Utility functions for generating and handling URL slugs
 */

/**
 * Generate a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove accents and special characters
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove all non-alphanumeric characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove hyphens from start and end
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a unique slug by appending a number if necessary
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Validate if a string is a valid slug format
 * @param slug - The slug to validate
 * @returns True if valid slug format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Check if a string is a CUID (used for backward compatibility)
 * @param str - The string to check
 * @returns True if the string matches CUID format
 */
export function isCuid(str: string): boolean {
  // CUID format: starts with 'c' followed by alphanumeric characters
  return /^c[a-z0-9]{24,}$/i.test(str);
}

/**
 * Extract property and zone identifiers from a path
 * @param path - The URL path
 * @returns Object with propertyId/slug and zoneId/slug
 */
export function extractIdentifiersFromPath(path: string) {
  const parts = path.split('/').filter(Boolean);
  
  const propertyIndex = parts.indexOf('properties');
  const zoneIndex = parts.indexOf('zones');
  
  return {
    propertyIdentifier: propertyIndex !== -1 && parts[propertyIndex + 1] ? parts[propertyIndex + 1] : null,
    zoneIdentifier: zoneIndex !== -1 && parts[zoneIndex + 1] ? parts[zoneIndex + 1] : null,
  };
}