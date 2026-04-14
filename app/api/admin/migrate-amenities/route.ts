import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mapAirbnbAmenities } from '@/data/amenities'

/**
 * POST /api/admin/migrate-amenities
 * One-time migration: reads allAmenities from intelligence and maps to amenities field.
 * Admin only.
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult

  const user = await prisma.user.findUnique({
    where: { id: authResult.userId },
    select: { isAdmin: true },
  })

  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const properties = await prisma.property.findMany({
    where: {
      deletedAt: null,
      intelligence: { not: null },
    },
    select: { id: true, intelligence: true, amenities: true },
  })

  let migrated = 0
  for (const prop of properties) {
    const intel = prop.intelligence as Record<string, any>
    if (!intel?.allAmenities || !Array.isArray(intel.allAmenities)) continue
    if (prop.amenities && (prop.amenities as string[]).length > 0) continue

    const mapped = mapAirbnbAmenities(intel.allAmenities)
    if (mapped.length === 0) continue

    await prisma.property.update({
      where: { id: prop.id },
      data: { amenities: mapped },
    })
    migrated++
  }

  return NextResponse.json({ success: true, migrated, total: properties.length })
}
