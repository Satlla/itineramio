import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { Decimal } from '@prisma/client/runtime/library'

/**
 * POST /api/gestion/liquidations/[id]/recalculate
 * Recalculate a DRAFT liquidation to pick up new/removed reservations
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    const { id } = await params

    // Find the liquidation
    const liquidation = await prisma.liquidation.findFirst({
      where: { id, userId },
    })

    if (!liquidation) {
      return NextResponse.json(
        { error: 'Liquidación no encontrada' },
        { status: 404 }
      )
    }

    if (liquidation.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Solo se pueden recalcular liquidaciones en borrador' },
        { status: 400 }
      )
    }

    // Parse metadata to get mode/config
    let metadata: any = {}
    try {
      metadata = liquidation.notes ? JSON.parse(liquidation.notes) : {}
    } catch {
      metadata = {}
    }

    const mode = metadata.mode || 'LEGACY'
    const billingUnitGroupId = metadata.billingUnitGroupId
    const billingUnitIds = metadata.billingUnitIds

    // Unlink all current reservations and expenses
    await prisma.reservation.updateMany({
      where: { liquidationId: id },
      data: { liquidationId: null },
    })
    await prisma.propertyExpense.updateMany({
      where: { liquidationId: id },
      data: { liquidationId: null },
    })

    // Date range for the period
    const startDate = new Date(liquidation.year, liquidation.month - 1, 1)
    const endDate = new Date(liquidation.year, liquidation.month, 0, 23, 59, 59)

    // Variables for billing configuration
    let commissionType = 'PERCENTAGE'
    let commissionValue = new Decimal(0)
    let commissionVat = new Decimal(21)
    let cleaningType = 'FIXED_PER_RESERVATION'
    let cleaningValue = new Decimal(0)
    let monthlyFee = new Decimal(0)
    let monthlyFeeVat = new Decimal(21)
    let useBillingUnits = false
    let targetBillingUnitIds: string[] = []

    // Resolve billing config based on mode
    if (mode === 'GROUP' && billingUnitGroupId) {
      const group = await prisma.billingUnitGroup.findFirst({
        where: { id: billingUnitGroupId, userId },
        include: { billingUnits: { select: { id: true } } },
      })
      if (group) {
        commissionType = group.commissionType
        commissionValue = group.commissionValue
        commissionVat = group.commissionVat
        cleaningType = group.cleaningType
        cleaningValue = group.cleaningValue
        monthlyFee = group.monthlyFee
        monthlyFeeVat = group.monthlyFeeVat
        targetBillingUnitIds = group.billingUnits.map((u) => u.id)
        useBillingUnits = true
      }
    } else if (mode === 'INDIVIDUAL' && billingUnitIds?.length > 0) {
      const units = await prisma.billingUnit.findMany({
        where: { id: { in: billingUnitIds }, userId, ownerId: liquidation.ownerId },
      })
      if (units.length > 0) {
        const firstUnit = units[0]
        commissionType = firstUnit.commissionType
        commissionValue = firstUnit.commissionValue
        commissionVat = firstUnit.commissionVat
        cleaningType = firstUnit.cleaningType
        cleaningValue = firstUnit.cleaningValue
        monthlyFee = firstUnit.monthlyFee
        monthlyFeeVat = firstUnit.monthlyFeeVat
        targetBillingUnitIds = units.map((u) => u.id)
        useBillingUnits = true
      }
    }

    // Get reservations based on mode
    let reservations: any[] = []
    let expenses: any[] = []

    if (useBillingUnits && targetBillingUnitIds.length > 0) {
      reservations = await prisma.reservation.findMany({
        where: {
          billingUnitId: { in: targetBillingUnitIds },
          status: { in: ['COMPLETED', 'CONFIRMED'] },
          liquidationId: null,
          checkIn: { gte: startDate, lte: endDate },
        },
        include: { billingUnit: { select: { id: true, name: true } } },
      })
      expenses = await prisma.propertyExpense.findMany({
        where: {
          billingUnitId: { in: targetBillingUnitIds },
          chargeToOwner: true,
          liquidationId: null,
          date: { gte: startDate, lte: endDate },
        },
      })
    } else {
      // Legacy mode
      const billingConfigs = await prisma.propertyBillingConfig.findMany({
        where: { ownerId: liquidation.ownerId, isActive: true },
        include: { property: { select: { id: true, name: true } } },
      })

      if (billingConfigs.length > 0) {
        const configIds = billingConfigs.map((bc) => bc.id)
        reservations = await prisma.reservation.findMany({
          where: {
            billingConfigId: { in: configIds },
            status: { in: ['COMPLETED', 'CONFIRMED'] },
            liquidationId: null,
            checkIn: { gte: startDate, lte: endDate },
          },
          include: { billingConfig: true },
        })
        expenses = await prisma.propertyExpense.findMany({
          where: {
            billingConfigId: { in: configIds },
            date: { gte: startDate, lte: endDate },
            chargeToOwner: true,
            liquidationId: null,
          },
        })

        if (billingConfigs.length > 0) {
          const firstConfig = billingConfigs[0]
          commissionType = firstConfig.commissionType
          commissionValue = firstConfig.commissionValue
          commissionVat = firstConfig.commissionVat
          cleaningType = firstConfig.cleaningType
          cleaningValue = firstConfig.cleaningValue
          monthlyFee = firstConfig.monthlyFee
          monthlyFeeVat = firstConfig.monthlyFeeVat
        }
      }
    }

    // Calculate totals (same logic as POST)
    let totalIncome = new Decimal(0)
    let totalCommission = new Decimal(0)
    let totalCommissionVat = new Decimal(0)
    let totalCleaning = new Decimal(0)

    for (const reservation of reservations) {
      const hostEarnings = new Decimal(reservation.hostEarnings || 0)
      totalIncome = totalIncome.plus(hostEarnings)

      let resCommissionType = commissionType
      let resCommissionValue = commissionValue
      let resCommissionVat = commissionVat
      let resCleaningType = cleaningType
      let resCleaningValue = cleaningValue

      if (reservation.billingConfig) {
        resCommissionType = reservation.billingConfig.commissionType
        resCommissionValue = reservation.billingConfig.commissionValue
        resCommissionVat = reservation.billingConfig.commissionVat
        resCleaningType = reservation.billingConfig.cleaningType
        resCleaningValue = reservation.billingConfig.cleaningValue
      }

      let commission = new Decimal(0)
      if (resCommissionType === 'PERCENTAGE') {
        commission = hostEarnings.times(new Decimal(resCommissionValue || 0)).dividedBy(100)
      } else if (resCommissionType === 'FIXED_PER_RESERVATION') {
        commission = new Decimal(resCommissionValue || 0)
      }
      totalCommission = totalCommission.plus(commission)

      const commVat = commission.times(new Decimal(resCommissionVat || 21)).dividedBy(100)
      totalCommissionVat = totalCommissionVat.plus(commVat)

      let cleaning = new Decimal(0)
      if (resCleaningType === 'FIXED_PER_RESERVATION') {
        cleaning = new Decimal(resCleaningValue || 0)
      } else if (resCleaningType === 'PER_NIGHT') {
        cleaning = new Decimal(resCleaningValue || 0).times(reservation.nights || 1)
      }
      totalCleaning = totalCleaning.plus(cleaning)
    }

    // Monthly fee
    if (monthlyFee && monthlyFee.greaterThan(0)) {
      totalCommission = totalCommission.plus(monthlyFee)
      if (monthlyFeeVat) {
        totalCommissionVat = totalCommissionVat.plus(
          monthlyFee.times(new Decimal(monthlyFeeVat)).dividedBy(100)
        )
      }
    }

    // Expenses
    let totalExpenses = new Decimal(0)
    for (const expense of expenses) {
      totalExpenses = totalExpenses.plus(new Decimal(expense.amount || 0))
      totalExpenses = totalExpenses.plus(new Decimal(expense.vatAmount || 0))
    }

    // Owner retention
    const owner = await prisma.propertyOwner.findFirst({
      where: { id: liquidation.ownerId },
    })
    let totalRetention = new Decimal(0)
    if (owner?.type === 'PERSONA_FISICA') {
      totalRetention = totalCommission.times(new Decimal(15)).dividedBy(100)
    }

    const totalAmount = totalIncome
      .minus(totalCommission)
      .minus(totalCommissionVat)
      .minus(totalCleaning)
      .minus(totalExpenses)

    // Update liquidation totals
    await prisma.liquidation.update({
      where: { id },
      data: {
        totalIncome,
        totalCommission,
        totalCommissionVat,
        totalRetention,
        totalCleaning,
        totalExpenses,
        totalAmount,
      },
    })

    // Link new reservations and expenses
    if (reservations.length > 0) {
      await prisma.reservation.updateMany({
        where: { id: { in: reservations.map((r) => r.id) } },
        data: { liquidationId: id },
      })
    }
    if (expenses.length > 0) {
      await prisma.propertyExpense.updateMany({
        where: { id: { in: expenses.map((e) => e.id) } },
        data: { liquidationId: id },
      })
    }

    return NextResponse.json({
      success: true,
      reservationsCount: reservations.length,
      expensesCount: expenses.length,
      totals: {
        totalIncome: Number(totalIncome),
        totalCommission: Number(totalCommission),
        totalCommissionVat: Number(totalCommissionVat),
        totalRetention: Number(totalRetention),
        totalCleaning: Number(totalCleaning),
        totalExpenses: Number(totalExpenses),
        totalAmount: Number(totalAmount),
      },
    })
  } catch (error) {
    console.error('Error recalculating liquidation:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
