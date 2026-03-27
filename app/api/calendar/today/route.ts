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

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult instanceof Response) return authResult
  const userId = authResult.userId

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingLimit = new Date(today)
  upcomingLimit.setDate(today.getDate() + 7)

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

                const checkInDay = new Date(res.checkIn)
                checkInDay.setHours(0, 0, 0, 0)
                const checkOutDay = new Date(res.checkOut)
                checkOutDay.setHours(0, 0, 0, 0)

                if (isSameDay(checkInDay, today)) {
                  checkIns.push(base)
                } else if (checkInDay > today && checkInDay <= upcomingLimit) {
                  upcomingCheckIns.push({ ...base, date: toDateStr(checkInDay) })
                }

                if (isSameDay(checkOutDay, today)) {
                  checkOuts.push(base)
                } else if (checkOutDay > today && checkOutDay <= upcomingLimit) {
                  upcomingCheckOuts.push({ ...base, date: toDateStr(checkOutDay) })
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
      date: toDateStr(today),
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
