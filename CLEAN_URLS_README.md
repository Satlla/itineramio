# Clean URLs Implementation for Itineramio

This document outlines the implementation of clean, SEO-friendly URLs for the Itineramio application.

## Overview

The application now supports clean URLs that transform from:
- **Old**: `/properties/cmbyxou310001jv04bhfb0hy0/zones/cmbyxp8ub0001gz045cgvmlyb`
- **New**: `/properties/casa-madrid/wifi`

## URL Structure

### Clean URL Patterns

1. **Property URLs**
   - Clean: `/properties/{property-slug}`
   - Example: `/properties/casa-de-la-playa`

2. **Property Zones Listing**
   - Clean: `/properties/{property-slug}/zones`
   - Example: `/properties/casa-de-la-playa/zones`

3. **Zone Direct Access**
   - Clean: `/properties/{property-slug}/{zone-slug}`
   - Example: `/properties/casa-de-la-playa/wifi`

4. **Zone via Zones Path**
   - Clean: `/properties/{property-slug}/zones/{zone-slug}`
   - Example: `/properties/casa-de-la-playa/zones/wifi`

### Backward Compatibility

All existing ID-based URLs continue to work:
- `/properties/cmbyxou310001jv04bhfb0hy0`
- `/properties/cmbyxou310001jv04bhfb0hy0/zones/cmbyxp8ub0001gz045cgvmlyb`

## Implementation Components

### 1. Database Schema Changes

**Properties Table**
```sql
ALTER TABLE properties ADD COLUMN slug VARCHAR UNIQUE;
CREATE INDEX idx_properties_slug ON properties(slug);
```

**Zones Table**
```sql
ALTER TABLE zones ADD COLUMN slug VARCHAR;
CREATE UNIQUE INDEX idx_zones_property_slug ON zones(propertyId, slug);
CREATE INDEX idx_zones_slug ON zones(slug);
```

### 2. Slug Generation

**File**: `/src/lib/slug-utils.ts`

Key functions:
- `generateSlug(text)` - Converts text to URL-friendly slug
- `generateUniqueSlug(baseSlug, existingSlugs)` - Ensures uniqueness
- `isCuid(string)` - Checks if string is a CUID (for backward compatibility)

### 3. Middleware URL Rewriting

**File**: `/middleware.ts`

The middleware intercepts clean URLs and rewrites them to internal route handlers:

```typescript
// Middleware rewrites:
/properties/casa-madrid → /properties/slug/casa-madrid
/properties/casa-madrid/wifi → /properties/slug/casa-madrid/zone/wifi
```

### 4. Route Handlers

**New slug-based route handlers**:
- `/app/(dashboard)/properties/slug/[slug]/page.tsx`
- `/app/(dashboard)/properties/slug/[slug]/zones/page.tsx`  
- `/app/(dashboard)/properties/slug/[slug]/zones/[zoneSlug]/page.tsx`
- `/app/(dashboard)/properties/slug/[slug]/zone/[zoneSlug]/page.tsx`

These handlers resolve slugs to IDs and delegate to existing ID-based components.

### 5. Slug Resolution API

**Endpoints**:
- `GET /api/resolve/property/{identifier}` - Resolves property slug to data
- `GET /api/resolve/zone/{propertyId}/{zoneIdentifier}` - Resolves zone slug to data

**File**: `/src/lib/slug-resolver.ts`

### 6. Navigation Components

**File**: `/src/components/navigation/slug-link.tsx`

Provides helper components and functions:
- `<SlugLink>` - Smart link component that uses slugs when available
- `getPropertySlugUrl()` - Generate property URLs
- `getZoneSlugUrl()` - Generate zone URLs

## Usage Examples

### Creating Navigation Links

```tsx
import { SlugLink, getZoneSlugUrl } from '@/components/navigation/slug-link';

// Using SlugLink component
<SlugLink property={property} zone={zone}>
  Visit Zone
</SlugLink>

// Using URL generators
const url = getZoneSlugUrl(property, zone);
router.push(url);
```

### API Updates

**Properties API** now includes `slug` field:
```json
{
  "id": "cmbyxou310001jv04bhfb0hy0",
  "name": "Casa de la Playa",
  "slug": "casa-de-la-playa",
  // ... other fields
}
```

**Zones API** now includes `slug` field and automatically generates slugs for new zones.

## Slug Generation Rules

1. **Text Transformation**:
   - Convert to lowercase
   - Replace spaces with hyphens
   - Remove accents and special characters
   - Remove consecutive hyphens
   - Trim leading/trailing hyphens

2. **Uniqueness**:
   - Property slugs are globally unique
   - Zone slugs are unique within each property

3. **Examples**:
   - "Casa de la Playa" → "casa-de-la-playa"
   - "WiFi & Internet" → "wifi-internet"
   - "Información General" → "informacion-general"

## Migration

Existing properties and zones have been migrated with automatically generated slugs using the `/scripts/migrate-slugs.ts` script.

**Migration Results**:
- 2 properties migrated with slugs
- 16 zones migrated with slugs

## Testing Clean URLs

You can now access:

1. **Properties**:
   - `/properties/casa-de-la-playa`
   - `/properties/apartamento-centro-historico`

2. **Zones**:
   - `/properties/casa-de-la-playa/wifi`
   - `/properties/casa-de-la-playa/check-in`
   - `/properties/apartamento-centro-historico/wifi`

## Benefits

1. **SEO-Friendly**: Clean URLs are better for search engines
2. **User-Friendly**: URLs are readable and meaningful
3. **Shareable**: Easier to share and remember
4. **Professional**: More professional appearance
5. **Backward Compatible**: All existing URLs continue to work

## Future Enhancements

1. **Redirect Old URLs**: Implement 301 redirects from old to new URLs
2. **Custom Slugs**: Allow users to customize their property/zone slugs
3. **Internationalization**: Support for multiple language slugs
4. **Analytics**: Track usage of clean vs old URLs

## Files Modified/Created

### New Files:
- `/src/lib/slug-utils.ts` - Core slug utilities
- `/src/lib/slug-resolver.ts` - Server-side resolution
- `/src/components/navigation/slug-link.tsx` - Navigation helpers
- `/app/api/resolve/property/[identifier]/route.ts` - Property resolution API
- `/app/api/resolve/zone/[propertyId]/[zoneIdentifier]/route.ts` - Zone resolution API
- `/app/(dashboard)/properties/slug/[slug]/page.tsx` - Property slug route
- `/app/(dashboard)/properties/slug/[slug]/zones/page.tsx` - Property zones slug route
- `/app/(dashboard)/properties/slug/[slug]/zones/[zoneSlug]/page.tsx` - Zone slug route
- `/app/(dashboard)/properties/slug/[slug]/zone/[zoneSlug]/page.tsx` - Direct zone slug route
- `/scripts/migrate-slugs.ts` - Data migration script

### Modified Files:
- `/middleware.ts` - Added URL rewriting logic
- `/prisma/schema.prisma` - Added slug columns
- `/app/api/properties/route.ts` - Added slug generation and response
- `/app/api/properties/[id]/zones/route.ts` - Added slug generation for zones
- `/app/(dashboard)/main/page.tsx` - Updated to use clean URLs
- `/app/(dashboard)/properties/[id]/zones/[zoneId]/page.tsx` - Updated slug resolution

The implementation is production-ready and maintains full backward compatibility while providing modern, clean URLs for better user experience and SEO.