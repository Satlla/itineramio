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
      // Onboarding: Check if user has configured their company
      prisma.userInvoiceConfig.findUnique({
        where: { userId },
        select: { businessName: true, nif: true }
      }),
      // Onboarding: Check BillingUnits with owner assigned
      prisma.billingUnit.count({
        where: {
          userId,
          ownerId: { not: null }
        }
      }),
      // Onboarding: Check if user has any liquidations
      prisma.liquidation.count({
        where: { userId }
      }),
      // Pending actions: Reservations without liquidation (completed/confirmed only)
      prisma.reservation.count({
        where: {
          userId,
          billingUnitId: { not: null },
          liquidationId: null,
          status: { in: ['CONFIRMED', 'COMPLETED'] },
          checkOut: { lt: new Date() } // Only past reservations
        }
      }),
      // Pending actions: Draft invoices
      prisma.clientInvoice.count({
        where: {
          userId,
          status: 'DRAFT'
        }
      }),
      // Pending actions: Unpaid invoices (sent but not paid)
      prisma.clientInvoice.count({
        where: {
          userId,
          status: 'SENT'
        }
      }),
      // Total expenses
      prisma.propertyExpense.count({
        where: { userId }
      })
    ])

    // Get yearly income from reservations with financial breakdown
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

    // Get monthly income with financial breakdown
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

    // Use calculated manager amounts if available, otherwise estimate from commission
    const yearlyManagerAmount = Number(yearlyReservations._sum.managerAmount) || 0
    const monthlyManagerAmount = Number(monthlyReservations._sum.managerAmount) || 0
    const yearlyOwnerAmount = Number(yearlyReservations._sum.ownerAmount) || 0
    const monthlyOwnerAmount = Number(monthlyReservations._sum.ownerAmount) || 0
    const yearlyCleaningAmount = Number(yearlyReservations._sum.cleaningAmount) || 0
    const monthlyCleaningAmount = Number(monthlyReservations._sum.cleaningAmount) || 0

    // Get average commission rate from billing units
    const billingUnits = await prisma.billingUnit.findMany({
      where: { userId },
      select: { commissionValue: true }
    })

    const avgCommission = billingUnits.length > 0
      ? billingUnits.reduce((sum, c) => sum + Number(c.commissionValue), 0) / billingUnits.length
      : 15 // Default 15%

    // Calculate commission using manager amounts if available, otherwise estimate
    const yearlyCommission = yearlyManagerAmount > 0 ? yearlyManagerAmount : (yearlyIncome * avgCommission) / 100
    const monthlyCommission = monthlyManagerAmount > 0 ? monthlyManagerAmount : (monthlyIncome * avgCommission) / 100

    // Count pending liquidations using BillingUnits
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

    // Get existing liquidations for this year (indexed by ownerId-month)
    const existingLiquidations = await prisma.liquidation.findMany({
      where: { userId, year: currentYear },
      select: { month: true, ownerId: true }
    })
    const liquidatedOwnerMonths = new Set(
      existingLiquidations.map(l => `${l.ownerId}-${l.month}`)
    )

    // Count unique owner-month pairs that need liquidation
    const pendingOwnerMonths = new Set<string>()
    billingUnitsWithReservations.forEach(unit => {
      if (!unit.ownerId) return // Skip units without owner
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
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    })

    // Onboarding status
    const companyConfigured = !!(userInvoiceConfig?.businessName && userInvoiceConfig?.nif)
    const hasClients = totalOwners > 0
    const hasConfiguredProperties = configuredPropertiesCount > 0
    const hasLiquidations = liquidationsCount > 0
    const allComplete = companyConfigured && hasClients && hasConfiguredProperties && hasLiquidations

    return NextResponse.json({
      success: true,
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
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
