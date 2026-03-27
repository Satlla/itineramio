import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ICalParser } from '@/lib/ical-parser'

// Format date as YYYY-MM-DD using LOCAL time (not UTC) to avoid timezone shift
function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function parseIcalUrls(raw: string | null): { airbnb?: string; booking?: string; vrbo?: string } {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed === 'object' && parsed !== null) return parsed
  } catch {}
  return {}
}


export interface CalendarEvent {
  id: string
  guestName: string
  checkIn: string   // YYYY-MM-DD
  checkOut: string  // YYYY-MM-DD
  nights: number
  platform: string
  reservationCode?: string
  phoneLast4?: string
}

export interface CalendarProperty {
  id: string
  name: string
  profileImage?: string | null
  status: string
  hasIcalConfig: boolean
  icalConfig: { airbnb?: string; booking?: string; vrbo?: string }
  daysInMonth: number
  occupancy: Array<{ day: number; platform: string }>
  events: CalendarEvent[]
}

// GET /api/calendar/properties
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult instanceof Response) return authResult
  const userId = authResult.userId

  const { searchParams } = new URL(req.url)
  const now      = new Date()
  const year     = parseInt(searchParams.get('year')     || String(now.getFullYear()))
  const month    = parseInt(searchParams.get('month')    || String(now.getMonth() + 1))
  const endYear  = parseInt(searchParams.get('endYear')  || String(year))
  const endMonth = parseInt(searchParams.get('endMonth') || String(month))

  const properties = await prisma.property.findMany({
    where: { hostId: userId, deletedAt: null },
    select: {
      id: true,
      name: true,
      profileImage: true,
      status: true,
      billingConfig: { select: { icalUrl: true } }
    },
    orderBy: { name: 'asc' }
  })

  // Window covers from start of first month to end of last month
  const daysInMonth  = new Date(year, month, 0).getDate()
  const windowStart  = new Date(year, month - 1, 1)
  const windowEnd    = new Date(endYear, endMonth, 1)  // exclusive upper bound

  const results = await Promise.allSettled(
    properties.map(async (prop) => {
      const urls = parseIcalUrls(prop.billingConfig?.icalUrl ?? null)
      const hasConfig = !!(urls.airbnb || urls.booking || urls.vrbo)

      const occupancy: Array<{ day: number; platform: string }> = []
      const events: CalendarEvent[] = []
      const fetchErrors: string[] = []

      if (hasConfig) {
        const feeds: Array<{ url: string; platform: 'AIRBNB' | 'BOOKING' | 'VRBO' | 'OTHER' }> = []
        if (urls.airbnb) feeds.push({ url: urls.airbnb, platform: 'AIRBNB' })
        if (urls.booking) feeds.push({ url: urls.booking, platform: 'BOOKING' })
        if (urls.vrbo) feeds.push({ url: urls.vrbo, platform: 'VRBO' })

        // Fetch feeds sequentially to avoid rate limiting + add per-feed timeout
        for (const { url, platform } of feeds) {
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 12000)
            let reservations: Awaited<ReturnType<typeof ICalParser.fetchAndParseICal>>
            try {
              reservations = await ICalParser.fetchAndParseICal(url, platform, controller.signal)
            } finally {
              clearTimeout(timeoutId)
            }
            for (const res of reservations) {
              // Only include if overlaps with this month
              if (res.checkOut > windowStart && res.checkIn < windowEnd) {
                const notes = res.notes || ''
                const codeMatch = notes.match(/reservations\/details\/([A-Z0-9]+)/i)
                const phoneMatch = notes.match(/Last 4 Digits\):\s*(\d+)/i)
                events.push({
                  id: res.iCalUid || `${platform}-${res.checkIn.getTime()}`,
                  guestName: res.guestName,
                  checkIn: localDateStr(res.checkIn),
                  checkOut: localDateStr(res.checkOut),
                  nights: res.nights,
                  platform,
                  reservationCode: codeMatch?.[1],
                  phoneLast4: phoneMatch?.[1],
                })
              }

              // Build per-day occupancy for mini-calendar
              const cur = new Date(res.checkIn.getFullYear(), res.checkIn.getMonth(), res.checkIn.getDate())
              const end = new Date(res.checkOut.getFullYear(), res.checkOut.getMonth(), res.checkOut.getDate())
              while (cur < end) {
                if (cur.getFullYear() === year && cur.getMonth() + 1 === month) {
                  occupancy.push({ day: cur.getDate(), platform })
                }
                cur.setDate(cur.getDate() + 1)
              }
            }
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err)
            fetchErrors.push(`${platform}: ${msg}`)
          }
        }
      }

      return {
        id: prop.id,
        name: prop.name,
        profileImage: prop.profileImage,
        status: prop.status,
        hasIcalConfig: hasConfig,
        icalConfig: urls,
        daysInMonth,
        occupancy,
        events,
        _errors: fetchErrors
      }
    })
  )

  const data: CalendarProperty[] = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value
    return {
      id: properties[i].id,
      name: properties[i].name,
      profileImage: properties[i].profileImage,
      status: properties[i].status,
      hasIcalConfig: false,
      icalConfig: {},
      daysInMonth,
      occupancy: [],
      events: []
    }
  })

  return NextResponse.json({ year, month, daysInMonth, properties: data })
}
