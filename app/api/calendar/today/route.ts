import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ICalParser } from '@/lib/ical-parser'

export interface TodayEvent {
  propertyId: string
  propertyName: string
  propertyImage?: string | null
  guestName: string
  platform: 'AIRBNB' | 'BOOKING' | 'VRBO' | 'OTHER'
  nights?: number
  guestCount?: number
  date?: string // ISO date string for upcoming events
}

export interface TodayResponse {
  date: string
  summary: {
    checkInsCount: number
    checkOutsCount: number
  }
  checkIns: TodayEvent[]
  checkOuts: TodayEvent[]
  upcomingCheckIns: TodayEvent[]
  upcomingCheckOuts: TodayEvent[]
}

function parseIcalUrls(raw: string | null): { airbnb?: string; booking?: string; vrbo?: string } {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed === 'object' && parsed !== null) return parsed
  } catch {
    // legacy single URL
  }
  return {}
}

const TZ = 'Europe/Madrid'

// Returns YYYY-MM-DD in Spain timezone
function dateStrMadrid(d: Date): string {
  return d.toLocaleDateString('en-CA', { timeZone: TZ })
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult instanceof Response) return authResult
  const userId = authResult.userId

  const now = new Date()
  const todayStr = dateStrMadrid(now)  // YYYY-MM-DD in Spain timezone

  // upcomingLimit: 7 days from now, compared as date strings
  const upcomingLimit = new Date(now)
  upcomingLimit.setDate(upcomingLimit.getDate() + 7)
  const upcomingLimitStr = dateStrMadrid(upcomingLimit)

  try {
    const properties = await prisma.property.findMany({
      where: { hostId: userId, deletedAt: null },
      select: {
        id: true,
        name: true,
        profileImage: true,
        billingConfig: { select: { icalUrl: true } }
      }
    })

    const checkIns: TodayEvent[] = []
    const checkOuts: TodayEvent[] = []
    const upcomingCheckIns: TodayEvent[] = []
    const upcomingCheckOuts: TodayEvent[] = []

    await Promise.allSettled(
      properties.map(async (prop) => {
        const urls = parseIcalUrls(prop.billingConfig?.icalUrl ?? null)
        const feeds: Array<{ url: string; platform: 'AIRBNB' | 'BOOKING' | 'VRBO' | 'OTHER' }> = []

        if (urls.airbnb) feeds.push({ url: urls.airbnb, platform: 'AIRBNB' })
        if (urls.booking) feeds.push({ url: urls.booking, platform: 'BOOKING' })
        if (urls.vrbo) feeds.push({ url: urls.vrbo, platform: 'VRBO' })

        await Promise.allSettled(
          feeds.map(async ({ url, platform }) => {
            try {
              const reservations = await ICalParser.fetchAndParseICal(url, platform)
              for (const res of reservations) {
                const base: TodayEvent = {
                  propertyId: prop.id,
                  propertyName: prop.name,
                  propertyImage: prop.profileImage,
                  guestName: res.guestName,
                  platform,
                  nights: res.nights,
                  guestCount: res.guestCount
                }

                const checkInStr  = dateStrMadrid(res.checkIn)
                const checkOutStr = dateStrMadrid(res.checkOut)

                if (checkInStr === todayStr) {
                  checkIns.push(base)
                } else if (checkInStr > todayStr && checkInStr <= upcomingLimitStr) {
                  upcomingCheckIns.push({ ...base, date: checkInStr })
                }

                if (checkOutStr === todayStr) {
                  checkOuts.push(base)
                } else if (checkOutStr > todayStr && checkOutStr <= upcomingLimitStr) {
                  upcomingCheckOuts.push({ ...base, date: checkOutStr })
                }
              }
            } catch {
              // skip silently
            }
          })
        )
      })
    )

    // Sort upcoming by date ascending
    upcomingCheckIns.sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    upcomingCheckOuts.sort((a, b) => (a.date || '').localeCompare(b.date || ''))

    const response: TodayResponse = {
      date: todayStr,
      summary: {
        checkInsCount: checkIns.length,
        checkOutsCount: checkOuts.length
      },
      checkIns,
      checkOuts,
      upcomingCheckIns,
      upcomingCheckOuts
    }

    return NextResponse.json(response)
  } catch {
    return NextResponse.json({ error: 'Error fetching today events' }, { status: 500 })
  }
}
