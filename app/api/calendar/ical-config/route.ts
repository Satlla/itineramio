import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/calendar/ical-config?propertyId=xxx
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult instanceof Response) return authResult
  const userId = authResult.userId

  const { searchParams } = new URL(req.url)
  const propertyId = searchParams.get('propertyId')
  if (!propertyId) return NextResponse.json({ error: 'propertyId required' }, { status: 400 })

  const property = await prisma.property.findFirst({
    where: { id: propertyId, hostId: userId, deletedAt: null },
    select: { billingConfig: { select: { icalUrl: true } } }
  })

  if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let config = { airbnb: '', booking: '', vrbo: '' }
  try {
    const raw = property.billingConfig?.icalUrl
    if (raw) {
      const parsed = JSON.parse(raw)
      if (typeof parsed === 'object' && parsed !== null) config = { ...config, ...parsed }
    }
  } catch { /* legacy non-JSON value */ }

  return NextResponse.json(config)
}

// PUT /api/calendar/ical-config
export async function PUT(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult instanceof Response) return authResult
  const userId = authResult.userId

  const body = await req.json()
  const { propertyId, airbnb, booking, vrbo } = body

  if (!propertyId) return NextResponse.json({ error: 'propertyId required' }, { status: 400 })

  const property = await prisma.property.findFirst({
    where: { id: propertyId, hostId: userId, deletedAt: null },
    select: { id: true, billingConfig: { select: { id: true } } }
  })
  if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const icalUrl = JSON.stringify({
    airbnb: airbnb || '',
    booking: booking || '',
    vrbo: vrbo || ''
  })

  if (property.billingConfig) {
    await prisma.propertyBillingConfig.update({
      where: { propertyId },
      data: { icalUrl }
    })
  } else {
    await prisma.propertyBillingConfig.create({
      data: { propertyId, icalUrl }
    })
  }

  return NextResponse.json({ ok: true })
}
