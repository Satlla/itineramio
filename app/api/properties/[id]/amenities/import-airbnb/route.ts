import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mapAirbnbAmenities } from '@/data/amenities'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult

  const { id } = await params
  const body = await request.json()
  const { url } = body as { url: string }

  if (!url || !url.includes('airbnb')) {
    return NextResponse.json({ error: 'URL de Airbnb no valida' }, { status: 400 })
  }

  const property = await prisma.property.findFirst({
    where: { id, hostId: authResult.userId, deletedAt: null },
    select: { id: true, amenities: true },
  })

  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 })
  }

  // Scrape Airbnb listing amenities
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'}/api/public/demo-import-airbnb`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })

    const data = await res.json()
    if (!data.success || !data.data?.allAmenities) {
      return NextResponse.json({ error: 'No se pudieron importar los amenities' }, { status: 400 })
    }

    const mapped = mapAirbnbAmenities(data.data.allAmenities)
    const existing = (property.amenities as string[]) || []
    const merged = [...new Set([...existing, ...mapped])]

    await prisma.property.update({
      where: { id },
      data: { amenities: merged },
    })

    return NextResponse.json({
      success: true,
      imported: mapped.length,
      total: merged.length,
      amenities: merged,
    })
  } catch {
    return NextResponse.json({ error: 'Error al importar desde Airbnb' }, { status: 500 })
  }
}
