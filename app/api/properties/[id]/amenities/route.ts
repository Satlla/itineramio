import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult

  const { id } = await params
  const property = await prisma.property.findFirst({
    where: { id, hostId: authResult.userId, deletedAt: null },
    select: { amenities: true },
  })

  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    amenities: (property.amenities as string[]) || [],
  })
}

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
    select: { id: true },
  })

  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 })
  }

  await prisma.property.update({
    where: { id },
    data: { amenities },
  })

  return NextResponse.json({ success: true })
}
