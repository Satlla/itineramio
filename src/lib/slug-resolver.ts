/**
 * Server-side slug resolution utilities
 */

import { PrismaClient } from '@prisma/client';
import { isCuid } from './slug-utils';

const prisma = new PrismaClient();

export interface ResolvedProperty {
  id: string;
  slug: string | null;
  name: string;
}

export interface ResolvedZone {
  id: string;
  slug: string | null;
  name: any;
  propertyId: string | null;
}

/**
 * Resolve a property identifier (slug or ID) to property data
 * @param identifier - Property slug or ID
 * @returns Property data or null if not found
 */
export async function resolveProperty(identifier: string): Promise<ResolvedProperty | null> {
  try {
    // Check if it's a CUID (backward compatibility)
    if (isCuid(identifier)) {
      const property = await prisma.property.findUnique({
        where: { id: identifier },
        select: { id: true, slug: true, name: true }
      });
      return property;
    }
    
    // Treat as slug
    const property = await prisma.property.findUnique({
      where: { slug: identifier },
      select: { id: true, slug: true, name: true }
    });
    
    return property;
  } catch (error) {
    console.error('Error resolving property:', error);
    return null;
  }
}

/**
 * Resolve a zone identifier (slug or ID) within a property context
 * @param propertyId - Property ID (resolved)
 * @param zoneIdentifier - Zone slug or ID
 * @returns Zone data or null if not found
 */
export async function resolveZone(propertyId: string, zoneIdentifier: string): Promise<ResolvedZone | null> {
  try {
    // Check if it's a CUID (backward compatibility)
    if (isCuid(zoneIdentifier)) {
      const zone = await prisma.zone.findFirst({
        where: { 
          id: zoneIdentifier,
          propertyId: propertyId
        },
        select: { id: true, slug: true, name: true, propertyId: true }
      });
      return zone;
    }
    
    // Treat as slug
    const zone = await prisma.zone.findFirst({
      where: { 
        slug: zoneIdentifier,
        propertyId: propertyId
      },
      select: { id: true, slug: true, name: true, propertyId: true }
    });
    
    return zone;
  } catch (error) {
    console.error('Error resolving zone:', error);
    return null;
  }
}

/**
 * Get all properties with their slugs (for navigation)
 * @param hostId - Host ID to filter properties
 * @returns Array of properties with id, slug, and name
 */
export async function getPropertiesWithSlugs(hostId: string): Promise<ResolvedProperty[]> {
  try {
    const properties = await prisma.property.findMany({
      where: { hostId },
      select: { id: true, slug: true, name: true },
      orderBy: { name: 'asc' }
    });
    
    return properties.filter(p => p.slug) as ResolvedProperty[];
  } catch (error) {
    console.error('Error getting properties with slugs:', error);
    return [];
  }
}

/**
 * Get all zones with their slugs for a property (for navigation)
 * @param propertyId - Property ID to filter zones
 * @returns Array of zones with id, slug, and name
 */
export async function getZonesWithSlugs(propertyId: string): Promise<ResolvedZone[]> {
  try {
    const zones = await prisma.zone.findMany({
      where: { propertyId },
      select: { id: true, slug: true, name: true, propertyId: true },
      orderBy: { order: 'asc' }
    });
    
    return zones.filter(z => z.slug) as ResolvedZone[];
  } catch (error) {
    console.error('Error getting zones with slugs:', error);
    return [];
  }
}

/**
 * Generate clean URL for a property
 * @param property - Property data
 * @returns Clean URL path
 */
export function getPropertyUrl(property: ResolvedProperty): string {
  return `/properties/${property.slug || property.id}`;
}

/**
 * Generate clean URL for a zone
 * @param property - Property data
 * @param zone - Zone data
 * @returns Clean URL path
 */
export function getZoneUrl(property: ResolvedProperty, zone: ResolvedZone): string {
  return `/properties/${property.slug || property.id}/${zone.slug || zone.id}`;
}

/**
 * Generate clean URL for a zone within a property context
 * @param propertySlug - Property slug
 * @param zoneSlug - Zone slug
 * @returns Clean URL path
 */
export function getCleanZoneUrl(propertySlug: string, zoneSlug: string): string {
  return `/properties/${propertySlug}/${zoneSlug}`;
}