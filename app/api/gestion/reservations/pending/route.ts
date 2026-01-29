import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/reservations/pending
 * Get reservations pending to be invoiced, grouped by owner
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('ownerId')
    const propertyId = searchParams.get('propertyId')

    // Build where clause
    const where: any = {
      userId,
      invoiced: false,
      status: { not: 'CANCELLED' },
      billingConfig: {
        ownerId: { not: null }
      }
    }

    if (ownerId) {
      where.billingConfig.ownerId = ownerId
    }

    if (propertyId) {
      where.billingConfig.propertyId = propertyId
    }

    // Get pending reservations with owner and property info
    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        billingConfig: {
          select: {
            id: true,
            propertyId: true,
            ownerId: true,
            commissionValue: true,
            commissionType: true,
            property: {
              select: {
                id: true,
                name: true,
                city: true
              }
            },
            owner: {
              select: {
                id: true,
                type: true,
                firstName: true,
                lastName: true,
                companyName: true
              }
            }
          }
        }
      },
      orderBy: [
        { checkIn: 'desc' }
      ]
    })

    // Group by owner
    const byOwner = new Map<string, {
      owner: any
      properties: Map<string, {
        property: any
        reservations: any[]
        totals: {
          count: number
          nights: number
          hostEarnings: number
          managerAmount: number
          ownerAmount: number
        }
      }>
      totals: {
        count: number
        nights: number
        hostEarnings: number
        managerAmount: number
        ownerAmount: number
      }
    }>()

    for (const r of reservations) {
      const owner = r.billingConfig.owner
      if (!owner) continue

      if (!byOwner.has(owner.id)) {
        byOwner.set(owner.id, {
          owner,
          properties: new Map(),
          totals: {
            count: 0,
            nights: 0,
            hostEarnings: 0,
            managerAmount: 0,
            ownerAmount: 0
          }
        })
      }

      const ownerGroup = byOwner.get(owner.id)!
      const property = r.billingConfig.property

      if (!ownerGroup.properties.has(property.id)) {
        ownerGroup.properties.set(property.id, {
          property,
          reservations: [],
          totals: {
            count: 0,
            nights: 0,
            hostEarnings: 0,
            managerAmount: 0,
            ownerAmount: 0
          }
        })
      }

      const propertyGroup = ownerGroup.properties.get(property.id)!

      const reservation = {
        id: r.id,
        confirmationCode: r.confirmationCode,
        platform: r.platform,
        guestName: r.guestName,
        checkIn: r.checkIn.toISOString(),
        checkOut: r.checkOut.toISOString(),
        nights: r.nights,
        hostEarnings: Number(r.hostEarnings) || 0,
        managerAmount: Number(r.managerAmount) || 0,
        ownerAmount: Number(r.ownerAmount) || 0,
        cleaningAmount: Number(r.cleaningAmount) || 0,
        status: r.status
      }

      propertyGroup.reservations.push(reservation)
      propertyGroup.totals.count++
      propertyGroup.totals.nights += r.nights
      propertyGroup.totals.hostEarnings += reservation.hostEarnings
      propertyGroup.totals.managerAmount += reservation.managerAmount
      propertyGroup.totals.ownerAmount += reservation.ownerAmount

      ownerGroup.totals.count++
      ownerGroup.totals.nights += r.nights
      ownerGroup.totals.hostEarnings += reservation.hostEarnings
      ownerGroup.totals.managerAmount += reservation.managerAmount
      ownerGroup.totals.ownerAmount += reservation.ownerAmount
    }

    // Convert to array format
    const owners = Array.from(byOwner.values()).map(og => ({
      owner: og.owner,
      properties: Array.from(og.properties.values()).map(pg => ({
        property: pg.property,
        reservations: pg.reservations,
        totals: {
          ...pg.totals,
          hostEarnings: Math.round(pg.totals.hostEarnings * 100) / 100,
          managerAmount: Math.round(pg.totals.managerAmount * 100) / 100,
          ownerAmount: Math.round(pg.totals.ownerAmount * 100) / 100
        }
      })),
      totals: {
        ...og.totals,
        hostEarnings: Math.round(og.totals.hostEarnings * 100) / 100,
        managerAmount: Math.round(og.totals.managerAmount * 100) / 100,
        ownerAmount: Math.round(og.totals.ownerAmount * 100) / 100
      }
    }))

    // Sort by total manager amount descending
    owners.sort((a, b) => b.totals.managerAmount - a.totals.managerAmount)

    return NextResponse.json({
      owners,
      totalPending: reservations.length,
      totalAmount: Math.round(reservations.reduce((sum, r) => sum + (Number(r.managerAmount) || 0), 0) * 100) / 100
    })
  } catch (error) {
    console.error('Error fetching pending reservations:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
