import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/facturacion/properties
 * Obtener propiedades con estadísticas de facturación
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    // Get all properties with their billing configs
    const properties = await prisma.property.findMany({
      where: { userId },
      include: {
        billingConfig: {
          include: {
            owner: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Get reservations stats for each property
    const propertiesWithStats = await Promise.all(
      properties.map(async (property) => {
        // Get reservations for the year
        const reservations = await prisma.reservation.findMany({
          where: {
            propertyId: property.id,
            checkIn: {
              gte: new Date(year, 0, 1),
              lt: new Date(year + 1, 0, 1)
            },
            status: { in: ['CONFIRMED', 'COMPLETED'] }
          },
          select: {
            nights: true,
            hostEarnings: true,
            roomTotal: true
          }
        })

        // Calculate stats
        const totalReservations = reservations.length
        const totalNights = reservations.reduce((sum, r) => sum + (r.nights || 0), 0)
        const totalIncome = reservations.reduce((sum, r) => {
          const earnings = r.hostEarnings || r.roomTotal || 0
          return sum + Number(earnings)
        }, 0)

        // Calculate occupancy rate (nights booked / total nights in year * 100)
        const daysInYear = year === new Date().getFullYear()
          ? Math.ceil((new Date().getTime() - new Date(year, 0, 1).getTime()) / (1000 * 60 * 60 * 24))
          : 365
        const occupancyRate = daysInYear > 0 ? (totalNights / daysInYear) * 100 : 0

        // Average price per night
        const averageNightPrice = totalNights > 0 ? totalIncome / totalNights : 0

        // Count pending liquidations (months without liquidation)
        const liquidations = await prisma.liquidation.findMany({
          where: {
            userId,
            year,
            reservations: {
              some: {
                propertyId: property.id
              }
            }
          },
          select: { month: true, status: true }
        })

        // Find months with reservations but no liquidation
        const monthsWithReservations = await prisma.reservation.findMany({
          where: {
            propertyId: property.id,
            checkIn: {
              gte: new Date(year, 0, 1),
              lt: new Date(year + 1, 0, 1)
            },
            status: { in: ['CONFIRMED', 'COMPLETED'] }
          },
          select: {
            checkIn: true
          }
        })

        const uniqueMonths = new Set(
          monthsWithReservations.map(r => new Date(r.checkIn).getMonth() + 1)
        )
        const liquidatedMonths = new Set(liquidations.map(l => l.month))
        const pendingLiquidations = Array.from(uniqueMonths).filter(m => !liquidatedMonths.has(m)).length

        return {
          id: property.id,
          name: property.name,
          city: property.city || '',
          imageUrl: property.mainImage || property.images?.[0] || null,
          owner: property.billingConfig?.owner || null,
          billingConfig: property.billingConfig ? {
            commissionValue: Number(property.billingConfig.commissionValue),
            incomeReceiver: property.billingConfig.incomeReceiver
          } : null,
          stats: {
            totalReservations,
            totalIncome: Math.round(totalIncome * 100) / 100,
            totalNights,
            occupancyRate: Math.min(occupancyRate, 100),
            averageNightPrice: Math.round(averageNightPrice * 100) / 100,
            pendingLiquidations
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      properties: propertiesWithStats,
      year
    })
  } catch (error) {
    console.error('Error fetching facturacion properties:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
