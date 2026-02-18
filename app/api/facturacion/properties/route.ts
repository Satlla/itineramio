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
    // Only include properties that have billingConfig with an owner
    const properties = await prisma.property.findMany({
      where: {
        hostId: userId,
        deletedAt: null,
        billingConfig: {
          ownerId: { not: null }
        }
      },
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
        group: {
          select: {
            id: true,
            name: true,
            ownerId: true,
            commissionValue: true,
            incomeReceiver: true,
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

    // Group BillingUnits by their group
    const unitsByGroup = new Map<string, typeof billingUnits>()
    const standaloneUnits: typeof billingUnits = []

    billingUnits.forEach(unit => {
      if (unit.groupId) {
        const existing = unitsByGroup.get(unit.groupId) || []
        existing.push(unit)
        unitsByGroup.set(unit.groupId, existing)
      } else {
        standaloneUnits.push(unit)
      }
    })

    // Process groups (conjuntos) - aggregate stats from all units
    const groupsWithStats = Array.from(unitsByGroup.entries()).map(([groupId, units]) => {
      const firstUnit = units[0]
      const group = firstUnit.group!

      // Aggregate reservations from all units in the group
      const allReservations = units.flatMap(u => u.reservations || [])

      const totalReservations = allReservations.length
      const totalNights = allReservations.reduce((sum, r) => sum + (r.nights || 0), 0)
      const totalIncome = allReservations.reduce((sum, r) => {
        const earnings = r.hostEarnings || r.roomTotal || 0
        return sum + Number(earnings)
      }, 0)

      // For groups, calculate occupancy based on all units
      const totalDaysAvailable = daysInYear * units.length
      const occupancyRate = totalDaysAvailable > 0 ? (totalNights / totalDaysAvailable) * 100 : 0
      const averageNightPrice = totalNights > 0 ? totalIncome / totalNights : 0

      // Get owner from group
      const owner = group.owner
      let ownerName = null
      if (owner) {
        ownerName = owner.type === 'EMPRESA'
          ? owner.companyName
          : `${owner.firstName || ''} ${owner.lastName || ''}`.trim()
      }

      // Find pending liquidations
      const uniqueMonths = new Set(
        allReservations.map(r => new Date(r.checkIn).getMonth() + 1)
      )
      const ownerId = group.ownerId
      const ownerLiquidatedMonths = new Set(
        liquidations
          .filter(l => l.ownerId === ownerId)
          .map(l => l.month)
      )
      const pendingLiquidations = Array.from(uniqueMonths)
        .filter(m => !ownerLiquidatedMonths.has(m) && m <= currentMonth)
        .length

      // Get first unit with image for the group
      const imageUrl = units.find(u => u.imageUrl)?.imageUrl || null

      return {
        id: `group:${groupId}`,
        name: group.name,
        city: units[0]?.city || '',
        imageUrl,
        type: 'group' as const,
        owner: owner ? {
          id: owner.id,
          name: ownerName
        } : null,
        billingConfig: {
          commissionValue: Number(group.commissionValue ?? 0),
          incomeReceiver: group.incomeReceiver || 'OWNER'
        },
        unitCount: units.length,
        units: units.map(u => ({
          id: u.id,
          name: u.name,
          reservations: u.reservations?.length || 0
        })),
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

    // Process standalone BillingUnits (not in a group)
    const standaloneWithStats = standaloneUnits.map((unit) => {
      const reservations = unit.reservations || []

      const totalReservations = reservations.length
      const totalNights = reservations.reduce((sum, r) => sum + (r.nights || 0), 0)
      const totalIncome = reservations.reduce((sum, r) => {
        const earnings = r.hostEarnings || r.roomTotal || 0
        return sum + Number(earnings)
      }, 0)

      const occupancyRate = daysInYear > 0 ? (totalNights / daysInYear) * 100 : 0
      const averageNightPrice = totalNights > 0 ? totalIncome / totalNights : 0

      // Get owner
      const owner = unit.owner
      let ownerName = null
      if (owner) {
        ownerName = owner.type === 'EMPRESA'
          ? owner.companyName
          : `${owner.firstName || ''} ${owner.lastName || ''}`.trim()
      }

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

      return {
        id: `unit:${unit.id}`,
        name: unit.name,
        city: unit.city || '',
        imageUrl: unit.imageUrl || null,
        type: 'billingUnit' as const,
        owner: owner ? {
          id: owner.id,
          name: ownerName
        } : null,
        billingConfig: {
          commissionValue: Number(unit.commissionValue ?? 0),
          incomeReceiver: unit.incomeReceiver || 'OWNER'
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

    // Combine: legacy properties + groups + standalone units
    const allProperties = [...propertiesWithStats, ...groupsWithStats, ...standaloneWithStats]
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
