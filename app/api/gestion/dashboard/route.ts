import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/dashboard
 * Obtener estadísticas del dashboard de gestión
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1

    // Get counts
    const [
      totalProperties,
      totalOwners,
      totalInvoices,
      pendingInvoices
    ] = await Promise.all([
      prisma.property.count({ where: { userId } }),
      prisma.propertyOwner.count({ where: { userId } }),
      prisma.clientInvoice.count({
        where: {
          userId,
          issueDate: {
            gte: new Date(currentYear, 0, 1)
          }
        }
      }),
      prisma.clientInvoice.count({
        where: {
          userId,
          status: { in: ['DRAFT', 'ISSUED', 'SENT'] }
        }
      })
    ])

    // Get yearly income from reservations
    const yearlyReservations = await prisma.reservation.aggregate({
      where: {
        userId,
        checkIn: {
          gte: new Date(currentYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1)
        },
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      },
      _sum: {
        hostEarnings: true,
        roomTotal: true
      }
    })

    // Get monthly income
    const monthlyReservations = await prisma.reservation.aggregate({
      where: {
        userId,
        checkIn: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lt: new Date(currentYear, currentMonth, 1)
        },
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      },
      _sum: {
        hostEarnings: true,
        roomTotal: true
      }
    })

    // Calculate totals
    const yearlyIncome = Number(yearlyReservations._sum.hostEarnings || yearlyReservations._sum.roomTotal || 0)
    const monthlyIncome = Number(monthlyReservations._sum.hostEarnings || monthlyReservations._sum.roomTotal || 0)

    // Get average commission rate from billing configs
    const billingConfigs = await prisma.propertyBillingConfig.findMany({
      where: {
        property: { userId }
      },
      select: {
        commissionValue: true
      }
    })

    const avgCommission = billingConfigs.length > 0
      ? billingConfigs.reduce((sum, c) => sum + Number(c.commissionValue), 0) / billingConfigs.length
      : 15 // Default 15%

    const yearlyCommission = (yearlyIncome * avgCommission) / 100
    const monthlyCommission = (monthlyIncome * avgCommission) / 100

    // Count pending liquidations (months with reservations but no liquidation)
    // Simplified: count properties with billing config but check if they have reservations
    const propertiesWithReservations = await prisma.property.findMany({
      where: {
        userId,
        billingConfig: { isNot: null }
      },
      select: {
        id: true,
        reservations: {
          where: {
            checkIn: {
              gte: new Date(currentYear, 0, 1),
              lt: new Date(currentYear + 1, 0, 1)
            },
            status: { in: ['CONFIRMED', 'COMPLETED'] }
          },
          select: { checkIn: true }
        }
      }
    })

    // Get existing liquidations for this year
    const existingLiquidations = await prisma.liquidation.findMany({
      where: { userId, year: currentYear },
      select: { month: true }
    })
    const liquidatedMonths = new Set(existingLiquidations.map(l => l.month))

    // Count months with reservations that don't have liquidations
    let pendingLiquidations = 0
    propertiesWithReservations.forEach(property => {
      const monthsWithReservations = new Set(
        property.reservations.map(r => new Date(r.checkIn).getMonth() + 1)
      )
      monthsWithReservations.forEach(month => {
        if (!liquidatedMonths.has(month) && month <= currentMonth) {
          pendingLiquidations++
        }
      })
    })

    // Recent reservations count
    const recentReservations = await prisma.reservation.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalProperties,
        totalOwners,
        totalInvoices,
        pendingInvoices,
        yearlyIncome: Math.round(yearlyIncome * 100) / 100,
        yearlyCommission: Math.round(yearlyCommission * 100) / 100,
        monthlyIncome: Math.round(monthlyIncome * 100) / 100,
        monthlyCommission: Math.round(monthlyCommission * 100) / 100,
        pendingLiquidations,
        recentReservations
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
