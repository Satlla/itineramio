import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { Decimal } from '@prisma/client/runtime/library'

/**
 * GET /api/gestion/liquidations/preview
 * Preview liquidation data before generating
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
    const year = parseInt(searchParams.get('year') || '')
    const month = parseInt(searchParams.get('month') || '')
    const mode = searchParams.get('mode') as 'GROUP' | 'INDIVIDUAL' | null
    const billingUnitGroupId = searchParams.get('billingUnitGroupId')
    const billingUnitIdsParam = searchParams.get('billingUnitIds')

    if (!ownerId || !year || !month) {
      return NextResponse.json(
        { error: 'Propietario, año y mes son requeridos' },
        { status: 400 }
      )
    }

    // Verify owner belongs to user
    const owner = await prisma.propertyOwner.findFirst({
      where: { id: ownerId, userId },
    })

    if (!owner) {
      return NextResponse.json(
        { error: 'Propietario no encontrado' },
        { status: 404 }
      )
    }

    // Get billing unit IDs based on mode
    let billingUnitIds: string[] = []

    if (mode === 'GROUP' && billingUnitGroupId) {
      // Get all billing units in the group
      const group = await prisma.billingUnitGroup.findFirst({
        where: { id: billingUnitGroupId, userId },
        include: {
          billingUnits: {
            select: { id: true, name: true }
          }
        }
      })

      if (!group) {
        return NextResponse.json(
          { error: 'Conjunto no encontrado' },
          { status: 404 }
        )
      }

      billingUnitIds = group.billingUnits.map(u => u.id)
    } else if (mode === 'INDIVIDUAL' && billingUnitIdsParam) {
      billingUnitIds = billingUnitIdsParam.split(',')
    } else {
      // Fallback: get all billing units for this owner (individual + from groups)
      const units = await prisma.billingUnit.findMany({
        where: { userId, ownerId },
        select: { id: true }
      })
      // Also get units from groups owned by this owner
      const groups = await prisma.billingUnitGroup.findMany({
        where: { userId, ownerId },
        include: {
          billingUnits: { select: { id: true } }
        }
      })
      billingUnitIds = [
        ...units.map(u => u.id),
        ...groups.flatMap(g => g.billingUnits.map(u => u.id))
      ]
    }

    // Also check legacy PropertyBillingConfig for this owner
    const billingConfigs = await prisma.propertyBillingConfig.findMany({
      where: { ownerId, isActive: true },
      select: { id: true, property: { select: { id: true, name: true } } }
    })
    const billingConfigIds = billingConfigs.map(bc => bc.id)

    // Date range for the period
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    // Get reservations from billing units (by check-in month)
    const billingUnitReservations = billingUnitIds.length > 0 ? await prisma.reservation.findMany({
      where: {
        billingUnitId: { in: billingUnitIds },
        status: { in: ['COMPLETED', 'CONFIRMED'] },
        liquidationId: null,
        checkIn: {
          gte: startDate,
          lte: endDate,
        },
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
      orderBy: { checkIn: 'asc' }
    }) : []

    // Get reservations from legacy billing configs (by check-in month)
    const configReservations = billingConfigIds.length > 0 ? await prisma.reservation.findMany({
      where: {
        billingConfigId: { in: billingConfigIds },
        billingUnitId: null, // Only if not already linked to a billing unit
        status: { in: ['COMPLETED', 'CONFIRMED'] },
        liquidationId: null,
        checkIn: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        billingConfig: {
          include: {
            property: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { checkIn: 'asc' }
    }) : []

    // Combine and dedupe reservations
    const allReservations = [
      ...billingUnitReservations.map(r => ({
        id: r.id,
        confirmationCode: r.confirmationCode,
        guestName: r.guestName,
        checkIn: r.checkIn.toISOString(),
        checkOut: r.checkOut.toISOString(),
        nights: r.nights,
        platform: r.platform,
        hostEarnings: Number(r.hostEarnings),
        cleaningFee: r.cleaningFee ? Number(r.cleaningFee) : null,
        property: r.billingUnit?.name || 'N/A',
        billingUnitId: r.billingUnitId,
        billingUnitCleaningValue: r.billingUnit?.cleaningValue ? Number(r.billingUnit.cleaningValue) : null,
        // Comisión del apartamento
        billingUnitCommissionType: r.billingUnit?.commissionType || null,
        billingUnitCommissionValue: r.billingUnit?.commissionValue ? Number(r.billingUnit.commissionValue) : null,
        billingUnitCommissionVat: r.billingUnit?.commissionVat ? Number(r.billingUnit.commissionVat) : null
      })),
      ...configReservations.map(r => ({
        id: r.id,
        confirmationCode: r.confirmationCode,
        guestName: r.guestName,
        checkIn: r.checkIn.toISOString(),
        checkOut: r.checkOut.toISOString(),
        nights: r.nights,
        platform: r.platform,
        hostEarnings: Number(r.hostEarnings),
        cleaningFee: r.cleaningFee ? Number(r.cleaningFee) : null,
        property: r.billingConfig?.property?.name || 'N/A',
        billingUnitId: null,
        billingUnitCleaningValue: null,
        // Comisión del config legacy
        billingUnitCommissionType: r.billingConfig?.commissionType || null,
        billingUnitCommissionValue: r.billingConfig?.commissionValue ? Number(r.billingConfig.commissionValue) : null,
        billingUnitCommissionVat: r.billingConfig?.commissionVat ? Number(r.billingConfig.commissionVat) : null
      }))
    ]

    // Get expenses for billing units
    const billingUnitExpenses = billingUnitIds.length > 0 ? await prisma.propertyExpense.findMany({
      where: {
        billingUnitId: { in: billingUnitIds },
        chargeToOwner: true,
        liquidationId: null,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        billingUnit: {
          select: { id: true, name: true }
        }
      },
      orderBy: { date: 'asc' }
    }) : []

    // Get expenses from legacy billing configs
    const configExpenses = billingConfigIds.length > 0 ? await prisma.propertyExpense.findMany({
      where: {
        billingConfigId: { in: billingConfigIds },
        billingUnitId: null,
        chargeToOwner: true,
        liquidationId: null,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        billingConfig: {
          include: {
            property: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { date: 'asc' }
    }) : []

    // Combine expenses
    const allExpenses = [
      ...billingUnitExpenses.map(e => ({
        id: e.id,
        date: e.date.toISOString(),
        concept: e.concept,
        category: e.category,
        amount: Number(e.amount),
        vatAmount: Number(e.vatAmount || 0),
        property: e.billingUnit?.name || 'N/A',
        billingUnitId: e.billingUnitId
      })),
      ...configExpenses.map(e => ({
        id: e.id,
        date: e.date.toISOString(),
        concept: e.concept,
        category: e.category,
        amount: Number(e.amount),
        vatAmount: Number(e.vatAmount || 0),
        property: e.billingConfig?.property?.name || 'N/A',
        billingUnitId: null
      }))
    ]

    // Calculate totals
    // Get billing config for commission calculation
    let commissionType = 'PERCENTAGE'
    let commissionValue = new Decimal(0)
    let commissionVat = new Decimal(21)
    let cleaningType = 'FIXED_PER_RESERVATION'
    let cleaningValue = new Decimal(0)
    let monthlyFee = new Decimal(0)
    let monthlyFeeVat = new Decimal(21)
    let incomeReceiver = 'MANAGER' // Default: manager receives income

    if (mode === 'GROUP' && billingUnitGroupId) {
      const group = await prisma.billingUnitGroup.findFirst({
        where: { id: billingUnitGroupId, userId }
      })
      if (group) {
        commissionType = group.commissionType
        commissionValue = group.commissionValue
        commissionVat = group.commissionVat
        cleaningType = group.cleaningType
        cleaningValue = group.cleaningValue
        monthlyFee = group.monthlyFee
        monthlyFeeVat = group.monthlyFeeVat
        incomeReceiver = group.incomeReceiver || 'MANAGER'
      }
    } else if (billingUnitIds.length > 0) {
      // Use first billing unit's config
      const unit = await prisma.billingUnit.findFirst({
        where: { id: billingUnitIds[0], userId }
      })
      if (unit) {
        commissionType = unit.commissionType
        commissionValue = unit.commissionValue
        commissionVat = unit.commissionVat
        cleaningType = unit.cleaningType
        cleaningValue = unit.cleaningValue
        monthlyFee = unit.monthlyFee
        monthlyFeeVat = unit.monthlyFeeVat
        incomeReceiver = unit.incomeReceiver || 'MANAGER'
      }
    } else if (billingConfigIds.length > 0) {
      const config = await prisma.propertyBillingConfig.findFirst({
        where: { id: billingConfigIds[0] }
      })
      if (config) {
        commissionType = config.commissionType
        commissionValue = config.commissionValue
        commissionVat = config.commissionVat
        cleaningType = config.cleaningType
        cleaningValue = config.cleaningValue
        monthlyFee = config.monthlyFee
        monthlyFeeVat = config.monthlyFeeVat
        incomeReceiver = config.incomeReceiver || 'MANAGER'
      }
    }

    let totalIncome = new Decimal(0)
    let totalCommission = new Decimal(0)
    let totalCommissionVat = new Decimal(0)
    let totalCleaning = new Decimal(0)

    for (const res of allReservations) {
      const hostEarnings = new Decimal(res.hostEarnings)
      totalIncome = totalIncome.plus(hostEarnings)

      // JERARQUÍA DE LIMPIEZA:
      // 1. Reserva (cleaningFee) - máxima prioridad si está rellena
      // 2. Apartamento (billingUnitCleaningValue) - prevalece sobre grupo
      // 3. Grupo/Config (cleaningValue) - valor por defecto
      let finalCleaningValue = cleaningValue // Default: grupo/config

      // Si el apartamento tiene limpieza definida, prevalece sobre el grupo
      if (res.billingUnitCleaningValue !== null && res.billingUnitCleaningValue !== undefined) {
        finalCleaningValue = new Decimal(res.billingUnitCleaningValue)
      }

      // Si la reserva tiene limpieza específica, tiene máxima prioridad
      if (res.cleaningFee !== null && res.cleaningFee !== undefined && res.cleaningFee > 0) {
        finalCleaningValue = new Decimal(res.cleaningFee)
      }

      // Calculate cleaning first (it's subtracted before commission)
      let cleaning = new Decimal(0)
      if (cleaningType === 'FIXED_PER_RESERVATION') {
        cleaning = finalCleaningValue
      } else if (cleaningType === 'PER_NIGHT') {
        cleaning = finalCleaningValue.times(res.nights)
      }
      totalCleaning = totalCleaning.plus(cleaning)

      // JERARQUÍA DE COMISIÓN:
      // 1. Apartamento (billingUnitCommissionValue) - prevalece sobre grupo
      // 2. Grupo/Config (commissionValue) - valor por defecto
      let finalCommissionType = commissionType
      let finalCommissionValue = commissionValue
      let finalCommissionVat = commissionVat

      if (res.billingUnitCommissionValue !== null && res.billingUnitCommissionValue !== undefined) {
        finalCommissionType = res.billingUnitCommissionType || commissionType
        finalCommissionValue = new Decimal(res.billingUnitCommissionValue)
        finalCommissionVat = res.billingUnitCommissionVat !== null ? new Decimal(res.billingUnitCommissionVat) : commissionVat
      }

      // Calculate commission on (hostEarnings - cleaning)
      // La comisión se calcula sobre el importe NETO (después de restar limpieza)
      const netForCommission = hostEarnings.minus(cleaning)
      let commission = new Decimal(0)
      if (finalCommissionType === 'PERCENTAGE') {
        commission = netForCommission.times(finalCommissionValue).dividedBy(100)
      } else if (finalCommissionType === 'FIXED_PER_RESERVATION') {
        commission = finalCommissionValue
      }

      totalCommission = totalCommission.plus(commission)
      totalCommissionVat = totalCommissionVat.plus(
        commission.times(finalCommissionVat).dividedBy(100)
      )
    }

    // Add monthly fee
    if (monthlyFee.greaterThan(0)) {
      totalCommission = totalCommission.plus(monthlyFee)
      totalCommissionVat = totalCommissionVat.plus(
        monthlyFee.times(monthlyFeeVat).dividedBy(100)
      )
    }

    // Calculate expenses total
    let totalExpenses = new Decimal(0)
    for (const exp of allExpenses) {
      totalExpenses = totalExpenses.plus(new Decimal(exp.amount))
      totalExpenses = totalExpenses.plus(new Decimal(exp.vatAmount))
    }

    const totalAmount = totalIncome
      .minus(totalCommission)
      .minus(totalCommissionVat)
      .minus(totalCleaning)
      .minus(totalExpenses)

    // Group by unit for breakdown
    const byUnitMap = new Map<string, { unitId: string; unitName: string; reservationsCount: number; totalIncome: number }>()
    for (const res of allReservations) {
      const key = res.billingUnitId || res.property
      const existing = byUnitMap.get(key)
      if (existing) {
        existing.reservationsCount++
        existing.totalIncome += res.hostEarnings
      } else {
        byUnitMap.set(key, {
          unitId: res.billingUnitId || key,
          unitName: res.property,
          reservationsCount: 1,
          totalIncome: res.hostEarnings
        })
      }
    }
    const byUnit = Array.from(byUnitMap.values())

    // Calculate what owner pays to manager (if owner receives income)
    const ownerPaysManager = totalCommission.plus(totalCommissionVat).plus(totalCleaning)

    // Calculate retention (use owner's retentionRate, or default: 15% for EMPRESA, 0% for PERSONA_FISICA)
    const retentionRate = owner.retentionRate !== null
      ? Number(owner.retentionRate)
      : (owner.type === 'EMPRESA' ? 15 : 0)
    const totalRetention = retentionRate > 0
      ? totalCommission.times(retentionRate).dividedBy(100)
      : new Decimal(0)

    return NextResponse.json({
      reservations: allReservations,
      expenses: allExpenses,
      totals: {
        totalIncome: Number(totalIncome),
        totalCommission: Number(totalCommission),
        totalCommissionVat: Number(totalCommissionVat),
        totalCleaning: Number(totalCleaning),
        totalExpenses: Number(totalExpenses),
        totalRetention: Number(totalRetention),
        totalAmount: Number(totalAmount), // Net to owner (if manager receives income)
        ownerPaysManager: Number(ownerPaysManager) // What owner pays (if owner receives income)
      },
      commission: {
        type: commissionType,
        value: Number(commissionValue),
        vatRate: Number(commissionVat)
      },
      retention: {
        rate: retentionRate,
        ownerType: owner.type
      },
      incomeReceiver,
      byUnit
    })
  } catch (error) {
    console.error('Error generating preview:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
