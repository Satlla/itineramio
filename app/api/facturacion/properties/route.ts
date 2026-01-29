import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/facturacion/properties
 * Obtener propiedades y apartamentos con estadísticas de facturación
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

    // Get all properties with their billing configs (legacy)
    const properties = await prisma.property.findMany({
      where: { hostId: userId },
      include: {
        billingConfig: {
          include: {
            owner: {
              select: {
                id: true,
                type: true,
                firstName: true,
                lastName: true,
                companyName: true
              }
            },
            reservations: {
              where: {
                checkIn: {
                  gte: new Date(year, 0, 1),
                  lt: new Date(year + 1, 0, 1)
                },
                status: { in: ['CONFIRMED', 'COMPLETED'] }
              },
              select: {
                nights: true,
                hostEarnings: true,
                roomTotal: true,
                checkIn: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Get all BillingUnits (new model - independent apartments)
    const billingUnits = await prisma.billingUnit.findMany({
      where: { userId, isActive: true },
      include: {
        owner: {
          select: {
            id: true,
            type: true,
            firstName: true,
            lastName: true,
            companyName: true
          }
        },
        reservations: {
          where: {
            checkIn: {
              gte: new Date(year, 0, 1),
              lt: new Date(year + 1, 0, 1)
            },
            status: { in: ['CONFIRMED', 'COMPLETED'] }
          },
          select: {
            nights: true,
            hostEarnings: true,
            roomTotal: true,
            checkIn: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Get liquidations for the year
    const liquidations = await prisma.liquidation.findMany({
      where: {
        userId,
        year
      },
      select: { month: true, ownerId: true }
    })

    const daysInYear = year === new Date().getFullYear()
      ? Math.ceil((new Date().getTime() - new Date(year, 0, 1).getTime()) / (1000 * 60 * 60 * 24))
      : 365
    const currentMonth = new Date().getMonth() + 1

    // Process legacy properties
    const propertiesWithStats = properties.map((property) => {
      const reservations = property.billingConfig?.reservations || []

      // Calculate stats
      const totalReservations = reservations.length
      const totalNights = reservations.reduce((sum, r) => sum + (r.nights || 0), 0)
      const totalIncome = reservations.reduce((sum, r) => {
        const earnings = r.hostEarnings || r.roomTotal || 0
        return sum + Number(earnings)
      }, 0)

      const occupancyRate = daysInYear > 0 ? (totalNights / daysInYear) * 100 : 0
      const averageNightPrice = totalNights > 0 ? totalIncome / totalNights : 0

      // Find months with reservations but no liquidation for this owner
      const uniqueMonths = new Set(
        reservations.map(r => new Date(r.checkIn).getMonth() + 1)
      )
      const ownerId = property.billingConfig?.ownerId
      const ownerLiquidatedMonths = new Set(
        liquidations
          .filter(l => l.ownerId === ownerId)
          .map(l => l.month)
      )
      const pendingLiquidations = Array.from(uniqueMonths)
        .filter(m => !ownerLiquidatedMonths.has(m) && m <= currentMonth)
        .length

      // Get owner name
      const owner = property.billingConfig?.owner
      let ownerName = null
      if (owner) {
        ownerName = owner.type === 'EMPRESA'
          ? owner.companyName
          : `${owner.firstName || ''} ${owner.lastName || ''}`.trim()
      }

      return {
        id: property.id,
        name: property.name,
        city: property.city || '',
        imageUrl: property.profileImage || null,
        type: 'property' as const,
        owner: owner ? {
          id: owner.id,
          name: ownerName
        } : null,
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

    // Process BillingUnits (new model)
    const unitsWithStats = billingUnits.map((unit) => {
      const reservations = unit.reservations || []

      const totalReservations = reservations.length
      const totalNights = reservations.reduce((sum, r) => sum + (r.nights || 0), 0)
      const totalIncome = reservations.reduce((sum, r) => {
        const earnings = r.hostEarnings || r.roomTotal || 0
        return sum + Number(earnings)
      }, 0)

      const occupancyRate = daysInYear > 0 ? (totalNights / daysInYear) * 100 : 0
      const averageNightPrice = totalNights > 0 ? totalIncome / totalNights : 0

      // Find pending liquidations
      const uniqueMonths = new Set(
        reservations.map(r => new Date(r.checkIn).getMonth() + 1)
      )
      const ownerId = unit.ownerId
      const ownerLiquidatedMonths = new Set(
        liquidations
          .filter(l => l.ownerId === ownerId)
          .map(l => l.month)
      )
      const pendingLiquidations = Array.from(uniqueMonths)
        .filter(m => !ownerLiquidatedMonths.has(m) && m <= currentMonth)
        .length

      // Get owner name
      const owner = unit.owner
      let ownerName = null
      if (owner) {
        ownerName = owner.type === 'EMPRESA'
          ? owner.companyName
          : `${owner.firstName || ''} ${owner.lastName || ''}`.trim()
      }

      return {
        id: `unit:${unit.id}`, // Prefix to distinguish from properties
        name: unit.name,
        city: unit.city || '',
        imageUrl: unit.imageUrl || null,
        type: 'billingUnit' as const,
        owner: owner ? {
          id: owner.id,
          name: ownerName
        } : null,
        billingConfig: {
          commissionValue: Number(unit.commissionValue),
          incomeReceiver: 'OWNER' // BillingUnits default to OWNER
        },
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

    // Combine and sort by name
    const allProperties = [...propertiesWithStats, ...unitsWithStats]
      .sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({
      success: true,
      properties: allProperties,
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
