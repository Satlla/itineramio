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

    // Get reservations from billing units
    const billingUnitReservations = billingUnitIds.length > 0 ? await prisma.reservation.findMany({
      where: {
        billingUnitId: { in: billingUnitIds },
        status: { in: ['COMPLETED', 'CONFIRMED'] },
        liquidationId: null,
        checkOut: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        billingUnit: {
          select: { id: true, name: true }
        }
      },
      orderBy: { checkIn: 'asc' }
    }) : []

    // Get reservations from legacy billing configs
    const configReservations = billingConfigIds.length > 0 ? await prisma.reservation.findMany({
      where: {
        billingConfigId: { in: billingConfigIds },
        billingUnitId: null, // Only if not already linked to a billing unit
        status: { in: ['COMPLETED', 'CONFIRMED'] },
        liquidationId: null,
        checkOut: {
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
        property: r.billingUnit?.name || 'N/A',
        billingUnitId: r.billingUnitId
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
        property: r.billingConfig?.property?.name || 'N/A',
        billingUnitId: null
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
      }
    }

    let totalIncome = new Decimal(0)
    let totalCommission = new Decimal(0)
    let totalCommissionVat = new Decimal(0)
    let totalCleaning = new Decimal(0)

    for (const res of allReservations) {
      const hostEarnings = new Decimal(res.hostEarnings)
      totalIncome = totalIncome.plus(hostEarnings)

      // Calculate commission
      let commission = new Decimal(0)
      if (commissionType === 'PERCENTAGE') {
        commission = hostEarnings.times(commissionValue).dividedBy(100)
      } else if (commissionType === 'FIXED_PER_RESERVATION') {
        commission = commissionValue
      }

      totalCommission = totalCommission.plus(commission)
      totalCommissionVat = totalCommissionVat.plus(
        commission.times(commissionVat).dividedBy(100)
      )

      // Calculate cleaning
      let cleaning = new Decimal(0)
      if (cleaningType === 'FIXED_PER_RESERVATION') {
        cleaning = cleaningValue
      } else if (cleaningType === 'PER_NIGHT') {
        cleaning = cleaningValue.times(res.nights)
      }
      totalCleaning = totalCleaning.plus(cleaning)
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

    return NextResponse.json({
      reservations: allReservations,
      expenses: allExpenses,
      totals: {
        totalIncome: Number(totalIncome),
        totalCommission: Number(totalCommission),
        totalCommissionVat: Number(totalCommissionVat),
        totalCleaning: Number(totalCleaning),
        totalExpenses: Number(totalExpenses),
        totalAmount: Number(totalAmount)
      },
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
