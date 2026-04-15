import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult

  const { id } = await params
  const body = await request.json()
  const { amenities } = body as { amenities: string[] }

  if (!Array.isArray(amenities)) {
    return NextResponse.json({ error: 'amenities must be an array' }, { status: 400 })
  }

  const property = await prisma.property.findFirst({
    where: { id, hostId: authResult.userId, deletedAt: null },
    select: { id: true, propertySetId: true },
  })

  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 })
  }

  if (!property.propertySetId) {
    return NextResponse.json({ error: 'Property does not belong to a set' }, { status: 400 })
  }

  const result = await prisma.property.updateMany({
    where: {
      propertySetId: property.propertySetId,
      hostId: authResult.userId,
      deletedAt: null,
    },
    data: { amenities },
  })

  return NextResponse.json({ success: true, updated: result.count })
}
