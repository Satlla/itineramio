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

    console.log('[recalculate] liquidation:', { id, ownerId: liquidation.ownerId, year: liquidation.year, month: liquidation.month, mode, billingUnitGroupId, billingUnitIds, metadata })

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

    console.log('[recalculate] billing config:', { useBillingUnits, targetBillingUnitIds, commissionType, commissionValue: commissionValue.toString() })

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
        include: {
          billingUnit: {
            select: {
              id: true,
              name: true,
              cleaningValue: true,
              cleaningVatIncluded: true,
              commissionType: true,
              commissionValue: true,
              commissionVat: true
            }
          }
        },
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
      // Legacy mode — try billingConfigs first, then fallback to billingUnits
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

      // Fallback: if no reservations found via billingConfig, try billingUnits for this owner
      if (reservations.length === 0) {
        const ownerUnits = await prisma.billingUnit.findMany({
          where: { ownerId: liquidation.ownerId, userId },
          select: {
            id: true, name: true,
            commissionType: true, commissionValue: true, commissionVat: true,
            cleaningType: true, cleaningValue: true, cleaningVatIncluded: true,
            monthlyFee: true, monthlyFeeVat: true,
          },
        })
        if (ownerUnits.length > 0) {
          const ownerUnitIds = ownerUnits.map((u) => u.id)
          reservations = await prisma.reservation.findMany({
            where: {
              billingUnitId: { in: ownerUnitIds },
              status: { in: ['COMPLETED', 'CONFIRMED'] },
              liquidationId: null,
              checkIn: { gte: startDate, lte: endDate },
            },
            include: {
              billingUnit: {
                select: {
                  id: true, name: true,
                  cleaningValue: true, cleaningVatIncluded: true,
                  commissionType: true, commissionValue: true, commissionVat: true,
                }
              }
            },
          })
          expenses = await prisma.propertyExpense.findMany({
            where: {
              billingUnitId: { in: ownerUnitIds },
              chargeToOwner: true,
              liquidationId: null,
              date: { gte: startDate, lte: endDate },
            },
          })
          if (ownerUnits.length > 0) {
            const firstUnit = ownerUnits[0]
            commissionType = firstUnit.commissionType
            commissionValue = firstUnit.commissionValue
            commissionVat = firstUnit.commissionVat
            cleaningType = firstUnit.cleaningType
            cleaningValue = firstUnit.cleaningValue
            monthlyFee = firstUnit.monthlyFee
            monthlyFeeVat = firstUnit.monthlyFeeVat
            useBillingUnits = true
            targetBillingUnitIds = ownerUnitIds
          }
          console.log('[recalculate] Legacy fallback to billingUnits:', ownerUnitIds.length, 'units, found', reservations.length, 'reservations')
        }
      }
    }

    console.log('[recalculate] found reservations:', reservations.length, 'expenses:', expenses.length)
    if (reservations.length === 0) {
      // Debug: check what reservations exist for this owner in this period
      const allOwnerReservations = await prisma.reservation.findMany({
        where: {
          userId,
          status: { in: ['COMPLETED', 'CONFIRMED'] },
          checkIn: { gte: startDate, lte: endDate },
        },
        select: { id: true, billingUnitId: true, billingConfigId: true, liquidationId: true, guestName: true, checkIn: true, status: true },
        take: 20,
      })
      console.log('[recalculate] DEBUG all reservations in period:', JSON.stringify(allOwnerReservations.map(r => ({
        id: r.id.slice(0, 8),
        guest: r.guestName,
        checkIn: r.checkIn,
        billingUnitId: r.billingUnitId?.slice(0, 8),
        billingConfigId: r.billingConfigId?.slice(0, 8),
        liquidationId: r.liquidationId?.slice(0, 8),
        status: r.status,
      }))))
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

      // Si el apartamento tiene comisión definida, prevalece sobre el grupo/config
      if (reservation.billingUnit?.commissionValue !== undefined && reservation.billingUnit?.commissionValue !== null) {
        resCommissionType = reservation.billingUnit.commissionType || resCommissionType
        resCommissionValue = new Decimal(reservation.billingUnit.commissionValue)
        resCommissionVat = reservation.billingUnit.commissionVat !== undefined ? new Decimal(reservation.billingUnit.commissionVat) : resCommissionVat
      }

      // JERARQUÍA DE LIMPIEZA:
      // 1. Reserva (cleaningFee) - máxima prioridad si está rellena
      // 2. Apartamento (billingUnit.cleaningValue) - prevalece sobre grupo
      // 3. Grupo/Config (resCleaningValue) - valor por defecto
      let finalCleaningValue = resCleaningValue // Default: grupo/config

      // Si el apartamento tiene limpieza definida, prevalece sobre el grupo
      if (reservation.billingUnit?.cleaningValue !== undefined && reservation.billingUnit?.cleaningValue !== null) {
        finalCleaningValue = new Decimal(reservation.billingUnit.cleaningValue)
      }

      // Si la reserva tiene limpieza específica, tiene máxima prioridad
      if (reservation.cleaningFee !== undefined && reservation.cleaningFee !== null && Number(reservation.cleaningFee) > 0) {
        finalCleaningValue = new Decimal(reservation.cleaningFee)
      }

      // Calcular limpieza PRIMERO (se resta antes de calcular comisión)
      let cleaning = new Decimal(0)
      if (resCleaningType === 'FIXED_PER_RESERVATION') {
        cleaning = new Decimal(finalCleaningValue || 0)
      } else if (resCleaningType === 'PER_NIGHT') {
        cleaning = new Decimal(finalCleaningValue || 0).times(reservation.nights || 1)
      }
      totalCleaning = totalCleaning.plus(cleaning)

      // Calcular comisión sobre el importe NETO (después de restar limpieza)
      const netForCommission = hostEarnings.minus(cleaning)
      let commission = new Decimal(0)
      if (resCommissionType === 'PERCENTAGE') {
        commission = netForCommission.times(new Decimal(resCommissionValue || 0)).dividedBy(100)
      } else if (resCommissionType === 'FIXED_PER_RESERVATION') {
        commission = new Decimal(resCommissionValue || 0)
      }
      totalCommission = totalCommission.plus(commission)
      // IVA de comisión: no se incluye en la liquidación (solo en factura fiscal)
      // totalCommissionVat se mantiene a 0
    }

    // Monthly fee
    if (monthlyFee && monthlyFee.greaterThan(0)) {
      totalCommission = totalCommission.plus(monthlyFee)
      // IVA de cuota mensual: no se incluye en la liquidación (solo en factura fiscal)
    }

    // Expenses
    let totalExpenses = new Decimal(0)
    for (const expense of expenses) {
      totalExpenses = totalExpenses.plus(new Decimal(expense.amount || 0))
      totalExpenses = totalExpenses.plus(new Decimal(expense.vatAmount || 0))
    }

    // Retención IRPF: no se incluye en la liquidación (solo en factura fiscal)
    const totalRetention = new Decimal(0)

    // Total sin IVA ni retención — la liquidación es un desglose informal
    const totalAmount = totalIncome
      .minus(totalCommission)
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
