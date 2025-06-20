'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface Property {
  id: string;
  slug?: string | null;
  name: string;
}

interface Zone {
  id: string;
  slug?: string | null;
  name: any;
}

interface SlugLinkProps {
  property: Property;
  zone?: Zone;
  children: ReactNode;
  className?: string;
  href?: string; // Override default href behavior
}

/**
 * Smart link component that automatically generates clean URLs using slugs
 * Falls back to ID-based URLs for backward compatibility
 */
export function SlugLink({ property, zone, children, className, href }: SlugLinkProps) {
  let linkHref: string;
  
  if (href) {
    // Use provided href
    linkHref = href;
  } else if (zone) {
    // Generate zone URL
    const propertyIdentifier = property.slug || property.id;
    const zoneIdentifier = zone.slug || zone.id;
    linkHref = `/properties/${propertyIdentifier}/${zoneIdentifier}`;
  } else {
    // Generate property URL
    const propertyIdentifier = property.slug || property.id;
    linkHref = `/properties/${propertyIdentifier}`;
  }
  
  return (
    <Link href={linkHref} className={className}>
      {children}
    </Link>
  );
}

/**
 * Generate clean URL for a property
 */
export function getPropertySlugUrl(property: Property): string {
  return `/properties/${property.slug || property.id}`;
}

/**
 * Generate clean URL for a zone
 */
export function getZoneSlugUrl(property: Property, zone: Zone): string {
  const propertyIdentifier = property.slug || property.id;
  const zoneIdentifier = zone.slug || zone.id;
  return `/properties/${propertyIdentifier}/${zoneIdentifier}`;
}

/**
 * Generate clean URL for zones listing
 */
export function getZonesSlugUrl(property: Property): string {
  return `/properties/${property.slug || property.id}/zones`;
}