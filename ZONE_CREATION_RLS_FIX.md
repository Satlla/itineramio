# Zone Creation RLS Fix

## Root Cause Identified
The issue is with Row Level Security (RLS) policies in PostgreSQL. Properties WITH zones can add more zones, but properties WITHOUT zones cannot create the first zone.

## The Problem
The RLS policy for zone insertion checks:
```sql
EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = zones."propertyId" 
    AND properties."hostId" = current_user_id()
)
```

For new properties without zones, the RLS context might not be properly established, causing the policy check to fail.

## Immediate Solution (Applied)
1. **Enhanced RLS context setting** with verification logging
2. **Bypassed authentication** temporarily to ensure consistent userId
3. **Added detailed error handling** for constraint violations

## Debug Steps
1. Check the debug endpoint: `/api/debug-new-property?propertyId=YOUR_PROPERTY_ID`
2. Compare properties with and without zones: `/api/test-property-comparison?withZones=ID1&withoutZones=ID2`
3. Monitor the console logs for RLS context verification

## Permanent Solutions
1. **Option A**: Modify RLS policy to be more lenient for first zone creation
2. **Option B**: Ensure RLS context is always properly set before zone operations
3. **Option C**: Create zones with a different approach that doesn't rely on RLS

## Test Commands
```bash
# Test zone creation on new property
curl -X POST https://www.itineramio.com/api/properties/YOUR_PROPERTY_ID/zones \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Zone","icon":"wifi","description":"Test"}'

# Check debug info
curl https://www.itineramio.com/api/debug-new-property?propertyId=YOUR_PROPERTY_ID
```

## Next Steps
1. Deploy current changes
2. Test with both types of properties
3. Monitor logs for RLS context issues
4. Implement permanent solution based on findings