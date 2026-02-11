import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { unstable_cache } from 'next/cache'

// Cache dashboard stats for 60 seconds per user
const getCachedDashboardStats = unstable_cache(
  async (userId: string) => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1

    // Get counts - all in parallel for better performance
    const [
      totalProperties,
      totalOwners,
      totalInvoices,
      pendingInvoices,
      userInvoiceConfig,
      configuredPropertiesCount,
      liquidationsCount,
      unliquidatedReservationsCount,
      draftInvoicesCount,
      unpaidInvoicesCount,
      totalExpenses
    ] = await Promise.all([
      prisma.billingUnit.count({ where: { userId } }),
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
      }),
      prisma.userInvoiceConfig.findUnique({
        where: { userId },
        select: { businessName: true, nif: true }
      }),
      prisma.billingUnit.count({
        where: { userId }
      }),
      prisma.liquidation.count({
        where: { userId }
      }),
      prisma.reservation.count({
        where: {
          userId,
          billingUnitId: { not: null },
          liquidationId: null,
          status: { in: ['CONFIRMED', 'COMPLETED'] },
          checkOut: { lt: new Date() }
        }
      }),
      prisma.clientInvoice.count({
        where: {
          userId,
          status: 'DRAFT'
        }
      }),
      prisma.clientInvoice.count({
        where: {
          userId,
          status: 'SENT'
        }
      }),
      prisma.propertyExpense.count({
        where: { userId }
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
        roomTotal: true,
        ownerAmount: true,
        managerAmount: true,
        cleaningAmount: true
      },
      _count: true
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
        roomTotal: true,
        ownerAmount: true,
        managerAmount: true,
        cleaningAmount: true
      },
      _count: true
    })

    // Get pending to invoice count
    const pendingToInvoice = await prisma.reservation.count({
      where: {
        userId,
        invoiced: false,
        status: { not: 'CANCELLED' }
      }
    })

    // Calculate totals
    const yearlyIncome = Number(yearlyReservations._sum.hostEarnings || yearlyReservations._sum.roomTotal || 0)
    const monthlyIncome = Number(monthlyReservations._sum.hostEarnings || monthlyReservations._sum.roomTotal || 0)

    const yearlyManagerAmount = Number(yearlyReservations._sum.managerAmount) || 0
    const monthlyManagerAmount = Number(monthlyReservations._sum.managerAmount) || 0
    const yearlyOwnerAmount = Number(yearlyReservations._sum.ownerAmount) || 0
    const monthlyOwnerAmount = Number(monthlyReservations._sum.ownerAmount) || 0
    const yearlyCleaningAmount = Number(yearlyReservations._sum.cleaningAmount) || 0
    const monthlyCleaningAmount = Number(monthlyReservations._sum.cleaningAmount) || 0

    // Get average commission rate
    const billingUnits = await prisma.billingUnit.findMany({
      where: { userId },
      select: { commissionValue: true }
    })

    const avgCommission = billingUnits.length > 0
      ? billingUnits.reduce((sum, c) => sum + Number(c.commissionValue), 0) / billingUnits.length
      : 15

    const yearlyCommission = yearlyManagerAmount > 0 ? yearlyManagerAmount : (yearlyIncome * avgCommission) / 100
    const monthlyCommission = monthlyManagerAmount > 0 ? monthlyManagerAmount : (monthlyIncome * avgCommission) / 100

    // Count pending liquidations
    const billingUnitsWithReservations = await prisma.billingUnit.findMany({
      where: { userId },
      include: {
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

    const existingLiquidations = await prisma.liquidation.findMany({
      where: { userId, year: currentYear },
      select: { month: true, ownerId: true }
    })
    const liquidatedOwnerMonths = new Set(
      existingLiquidations.map(l => `${l.ownerId}-${l.month}`)
    )

    const pendingOwnerMonths = new Set<string>()
    billingUnitsWithReservations.forEach(unit => {
      if (!unit.ownerId) return
      const monthsWithReservations = new Set<number>(
        unit.reservations.map(r => new Date(r.checkIn).getMonth() + 1)
      )
      monthsWithReservations.forEach(month => {
        const key = `${unit.ownerId}-${month}`
        if (!liquidatedOwnerMonths.has(key) && month <= currentMonth) {
          pendingOwnerMonths.add(key)
        }
      })
    })
    const pendingLiquidations = pendingOwnerMonths.size

    // Recent reservations count
    const recentReservations = await prisma.reservation.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    // Onboarding status
    const companyConfigured = !!(userInvoiceConfig?.businessName && userInvoiceConfig?.nif)
    const hasClients = totalOwners > 0
    const hasConfiguredProperties = configuredPropertiesCount > 0
    const hasLiquidations = liquidationsCount > 0
    const allComplete = companyConfigured && hasClients && hasConfiguredProperties && hasLiquidations

    return {
      stats: {
        totalProperties,
        totalOwners,
        totalInvoices,
        pendingInvoices,
        pendingToInvoice,
        yearlyIncome: Math.round(yearlyIncome * 100) / 100,
        yearlyCommission: Math.round(yearlyCommission * 100) / 100,
        yearlyOwnerAmount: Math.round(yearlyOwnerAmount * 100) / 100,
        yearlyCleaningAmount: Math.round(yearlyCleaningAmount * 100) / 100,
        yearlyReservations: yearlyReservations._count,
        monthlyIncome: Math.round(monthlyIncome * 100) / 100,
        monthlyCommission: Math.round(monthlyCommission * 100) / 100,
        monthlyOwnerAmount: Math.round(monthlyOwnerAmount * 100) / 100,
        monthlyCleaningAmount: Math.round(monthlyCleaningAmount * 100) / 100,
        monthlyReservations: monthlyReservations._count,
        pendingLiquidations,
        recentReservations,
        avgCommission: Math.round(avgCommission * 10) / 10,
        totalExpenses
      },
      onboarding: {
        companyConfigured,
        hasClients,
        hasConfiguredProperties,
        hasLiquidations,
        allComplete
      },
      pendingActions: {
        unliquidatedReservations: unliquidatedReservationsCount,
        draftInvoices: draftInvoicesCount,
        unpaidInvoices: unpaidInvoicesCount
      }
    }
  },
  ['gestion-dashboard'],
  { revalidate: 60, tags: ['gestion-dashboard'] } // Cache for 60 seconds
)

/**
 * GET /api/gestion/dashboard
 * Obtener estadísticas del dashboard de gestión
 * Results are cached for 60 seconds per user to reduce DB load
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Use cached data (revalidates every 60 seconds)
    const data = await getCachedDashboardStats(userId)

    return NextResponse.json({
      success: true,
      ...data
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
