import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ICalParser } from '@/lib/ical-parser'

function parseIcalUrls(raw: string | null): { airbnb?: string; booking?: string; vrbo?: string } {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed === 'object' && parsed !== null) return parsed
  } catch {}
  return {}
}

// GET /api/calendar/property-events?propertyId=xxx&year=2026&month=3
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult instanceof Response) return authResult
  const userId = authResult.userId

  const { searchParams } = new URL(req.url)
  const propertyId = searchParams.get('propertyId')
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))
  const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))

  if (!propertyId) return NextResponse.json({ error: 'propertyId required' }, { status: 400 })

  const property = await prisma.property.findFirst({
    where: { id: propertyId, hostId: userId, deletedAt: null },
    select: {
      id: true,
      name: true,
      billingConfig: { select: { icalUrl: true } }
    }
  })
  if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const urls = parseIcalUrls(property.billingConfig?.icalUrl ?? null)
  const feeds: Array<{ url: string; platform: 'AIRBNB' | 'BOOKING' | 'VRBO' | 'OTHER' }> = []

  if (urls.airbnb) feeds.push({ url: urls.airbnb, platform: 'AIRBNB' })
  if (urls.booking) feeds.push({ url: urls.booking, platform: 'BOOKING' })
  if (urls.vrbo) feeds.push({ url: urls.vrbo, platform: 'VRBO' })

  const windowStart = new Date(year, month - 2, 24)
  const windowEnd = new Date(year, month, 7)

  const events: Array<{
    id: string
    guestName: string
    checkIn: string
    checkOut: string
    nights: number
    platform: string
    guestCount?: number
  }> = []

  await Promise.allSettled(
    feeds.map(async ({ url, platform }) => {
      try {
        const reservations = await ICalParser.fetchAndParseICal(url, platform)
        for (const res of reservations) {
          if (res.checkOut > windowStart && res.checkIn < windowEnd) {
            events.push({
              id: res.iCalUid || `${platform}-${res.checkIn.getTime()}`,
              guestName: res.guestName,
              checkIn: res.checkIn.toISOString().split('T')[0],
              checkOut: res.checkOut.toISOString().split('T')[0],
              nights: res.nights,
              platform,
              guestCount: res.guestCount
            })
          }
        }
      } catch {
        // skip failed feed
      }
    })
  )

  events.sort((a, b) => a.checkIn.localeCompare(b.checkIn))

  return NextResponse.json({ propertyId, year, month, events })
}
