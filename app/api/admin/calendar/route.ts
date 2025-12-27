import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../src/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const propertyId = searchParams.get('propertyId')

    // Default to current month if no dates provided
    const now = new Date()
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0) // End of next month

    const start = startDate ? new Date(startDate) : defaultStart
    const end = endDate ? new Date(endDate) : defaultEnd

    // Build where clause
    const where: any = {
      host: { isAdmin: false }, // Only get regular user properties
      status: { in: ['ACTIVE', 'TRIAL'] } // Only active properties
    }

    if (propertyId) {
      where.id = propertyId
    }

    // Get properties with their reservations
    const properties = await prisma.property.findMany({
      where,
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        propertySet: {
          select: {
            id: true,
            name: true
          }
        },
        // calendarReservations: {
        //   where: {
        //     OR: [
        //       {
        //         checkIn: {
        //           gte: start,
        //           lte: end
        //         }
        //       },
        //       {
        //         checkOut: {
        //           gte: start,
        //           lte: end
        //         }
        //       },
        //       {
        //         AND: [
        //           { checkIn: { lte: start } },
        //           { checkOut: { gte: end } }
        //         ]
        //       }
        //     ]
        //   },
        //   orderBy: {
        //     checkIn: 'asc'
        //   }
        // },
        // calendarSync: true
      },
      orderBy: [
        { propertySet: { name: 'asc' } },
        { name: 'asc' }
      ]
    })

    // Get today's check-ins and check-outs
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Temporarily disabled calendar reservations functionality
    const todayCheckIns: any[] = []
    const todayCheckOuts: any[] = []

    // Group properties by property set
    const propertyGroups: any[] = []
    const ungroupedProperties: any[] = []
    const setMap = new Map()

    properties.forEach(property => {
      const transformedProperty = {
        id: property.id,
        name: property.name,
        type: property.type,
        city: property.city,
        status: property.status,
        reservations: [], // Temporarily disabled calendar reservations
        syncConfig: null, // Temporarily disabled calendar sync
        host: property.host
      }

      if (property.propertySet) {
        if (!setMap.has(property.propertySet.id)) {
          setMap.set(property.propertySet.id, {
            id: property.propertySet.id,
            name: property.propertySet.name,
            properties: [],
            isCollapsed: false
          })
        }
        setMap.get(property.propertySet.id).properties.push(transformedProperty)
      } else {
        ungroupedProperties.push(transformedProperty)
      }
    })

    // Add property sets to groups
    setMap.forEach(group => {
      propertyGroups.push(group)
    })

    // Add ungrouped properties as individual groups
    ungroupedProperties.forEach(property => {
      propertyGroups.push({
        id: `single-${property.id}`,
        name: property.name,
        properties: [property],
        isCollapsed: false
      })
    })

    return NextResponse.json({
      success: true,
      propertyGroups,
      todayCheckIns: todayCheckIns.map(res => ({
        id: res.id,
        propertyId: res.propertyId,
        propertyName: res.property.name,
        source: res.source,
        guestName: res.guestName,
        checkIn: res.checkIn.toISOString(),
        checkOut: res.checkOut.toISOString(),
        nights: res.nights,
        guestCount: res.guestCount,
        status: res.status
      })),
      todayCheckOuts: todayCheckOuts.map(res => ({
        id: res.id,
        propertyId: res.propertyId,
        propertyName: res.property.name,
        source: res.source,
        guestName: res.guestName,
        checkIn: res.checkIn.toISOString(),
        checkOut: res.checkOut.toISOString(),
        nights: res.nights,
        guestCount: res.guestCount,
        status: res.status
      })),
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      stats: {
        totalProperties: properties.length,
        totalReservations: 0, // Temporarily disabled
        todayCheckIns: todayCheckIns.length,
        todayCheckOuts: todayCheckOuts.length
      }
    })

  } catch (error) {
    console.error('Error fetching calendar data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}