import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { Decimal } from '@prisma/client/runtime/library'
import { gestionLiquidationRateLimiter, getRateLimitKey } from '@/lib/rate-limit'

/**
 * GET /api/gestion/liquidations
 * Listar liquidaciones con filtros
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const ownerId = searchParams.get('ownerId')
    const status = searchParams.get('status')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // Max 100

    const where: any = { userId }

    if (year) {
      const yearNum = parseInt(year)
      if (yearNum >= 2000 && yearNum <= 2100) {
        where.year = yearNum
      }
    }
    if (month) {
      const monthNum = parseInt(month)
      if (monthNum >= 1 && monthNum <= 12) {
        where.month = monthNum
      }
    }
    if (ownerId) where.ownerId = ownerId
    if (status) where.status = status

    const [liquidations, total] = await Promise.all([
      prisma.liquidation.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
              type: true,
              email: true,
            },
          },
          _count: {
            select: {
              reservations: true,
              expenses: true,
            },
          },
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.liquidation.count({ where }),
    ])

    // Calcular totales
    const totalsResult = await prisma.liquidation.aggregate({
      where,
      _sum: {
        totalIncome: true,
        totalCommission: true,
        totalRetention: true,
        totalAmount: true,
      },
    })

    return NextResponse.json({
      liquidations: liquidations.map((l) => ({
        id: l.id,
        year: l.year,
        month: l.month,
        owner: {
          id: l.owner.id,
          name: l.owner.type === 'EMPRESA'
            ? l.owner.companyName
            : `${l.owner.firstName} ${l.owner.lastName}`,
          email: l.owner.email,
        },
        totalIncome: Number(l.totalIncome),
        totalCommission: Number(l.totalCommission),
        totalCommissionVat: Number(l.totalCommissionVat),
        totalRetention: Number(l.totalRetention || 0),
        totalCleaning: Number(l.totalCleaning),
        totalExpenses: Number(l.totalExpenses),
        totalAmount: Number(l.totalAmount),
        status: l.status,
        invoiceNumber: l.invoiceNumber,
        paidAt: l.paidAt?.toISOString(),
        createdAt: l.createdAt.toISOString(),
        reservationsCount: l._count.reservations,
        expensesCount: l._count.expenses,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      totals: {
        totalIncome: Number(totalsResult._sum.totalIncome || 0),
        totalCommission: Number(totalsResult._sum.totalCommission || 0),
        totalRetention: Number(totalsResult._sum.totalRetention || 0),
        totalAmount: Number(totalsResult._sum.totalAmount || 0),
      },
    })
  } catch (error) {
    console.error('Error fetching liquidations:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/gestion/liquidations
 * Generar liquidación para un propietario y período
 * Soporta modo GROUP (por conjunto) e INDIVIDUAL (por apartamentos)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Rate limiting: max 10 liquidations per hour
    const rateLimitKey = getRateLimitKey(request, userId, 'gestion-liquidation')
    const rateLimitResult = gestionLiquidationRateLimiter(rateLimitKey)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Demasiadas liquidaciones generadas. Espera antes de intentar de nuevo.',
          resetIn: Math.ceil(rateLimitResult.resetIn / 1000 / 60) // minutes
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const {
      ownerId,
      propertyId,
      year,
      month,
      invoiceFormat,
      reservationIds,
      // New parameters for GROUP mode
      mode, // 'GROUP' | 'INDIVIDUAL'
      billingUnitGroupId, // If mode is GROUP
      billingUnitIds // If mode is INDIVIDUAL (array of billing unit IDs)
    } = body

    if (!ownerId || !year || !month) {
      return NextResponse.json(
        { error: 'Propietario, año y mes son requeridos' },
        { status: 400 }
      )
    }

    // Store format metadata for invoice generation
    const metadata: any = {
      invoiceFormat: invoiceFormat || 'detailed', // 'detailed' or 'grouped'
      propertyId: propertyId || null,
      reservationIds: reservationIds || null,
      mode: mode || 'LEGACY',
      billingUnitGroupId: billingUnitGroupId || null,
      billingUnitIds: billingUnitIds || null
    }

    // Verificar que no exista liquidación duplicada
    // For GROUP mode, check with billingUnitGroupId
    // For INDIVIDUAL mode, check standard owner/year/month
    const existingWhere: any = {
      userId,
      ownerId,
      year: parseInt(year),
      month: parseInt(month),
    }

    const existing = await prisma.liquidation.findFirst({
      where: existingWhere,
    })

    if (existing) {
      if (existing.status === 'DRAFT') {
        // DRAFT liquidation can be replaced - unlink reservations/expenses and delete
        await prisma.reservation.updateMany({
          where: { liquidationId: existing.id },
          data: { liquidationId: null }
        })
        await prisma.propertyExpense.updateMany({
          where: { liquidationId: existing.id },
          data: { liquidationId: null }
        })
        await prisma.liquidation.delete({
          where: { id: existing.id }
        })
      } else {
        return NextResponse.json(
          { error: 'Ya existe una liquidación para este propietario y período' },
          { status: 400 }
        )
      }
    }

    // Verificar que el propietario existe y pertenece al usuario
    const owner = await prisma.propertyOwner.findFirst({
      where: { id: ownerId, userId },
    })

    if (!owner) {
      return NextResponse.json(
        { error: 'Propietario no encontrado' },
        { status: 404 }
      )
    }

    // Fechas del período
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)

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

    // Handle GROUP mode
    if (mode === 'GROUP' && billingUnitGroupId) {
      const group = await prisma.billingUnitGroup.findFirst({
        where: { id: billingUnitGroupId, userId },
        include: {
          billingUnits: { select: { id: true } }
        }
      })

      if (!group) {
        return NextResponse.json(
          { error: 'Conjunto no encontrado' },
          { status: 404 }
        )
      }

      // Use group's billing configuration
      commissionType = group.commissionType
      commissionValue = group.commissionValue
      commissionVat = group.commissionVat
      cleaningType = group.cleaningType
      cleaningValue = group.cleaningValue
      monthlyFee = group.monthlyFee
      monthlyFeeVat = group.monthlyFeeVat

      targetBillingUnitIds = group.billingUnits.map(u => u.id)
      useBillingUnits = true
    }
    // Handle INDIVIDUAL mode with billing units
    else if (mode === 'INDIVIDUAL' && billingUnitIds && billingUnitIds.length > 0) {
      // Verify billing units belong to user and owner
      const units = await prisma.billingUnit.findMany({
        where: {
          id: { in: billingUnitIds },
          userId,
          ownerId
        }
      })

      if (units.length === 0) {
        return NextResponse.json(
          { error: 'No se encontraron apartamentos válidos' },
          { status: 404 }
        )
      }

      // Use first unit's configuration (or could average/aggregate)
      const firstUnit = units[0]
      commissionType = firstUnit.commissionType
      commissionValue = firstUnit.commissionValue
      commissionVat = firstUnit.commissionVat
      cleaningType = firstUnit.cleaningType
      cleaningValue = firstUnit.cleaningValue
      monthlyFee = firstUnit.monthlyFee
      monthlyFeeVat = firstUnit.monthlyFeeVat

      targetBillingUnitIds = units.map(u => u.id)
      useBillingUnits = true
    }

    // Get reservations based on mode
    let reservations: any[] = []
    let expenses: any[] = []

    if (useBillingUnits && targetBillingUnitIds.length > 0) {
      // Get reservations from billing units
      reservations = await prisma.reservation.findMany({
        where: {
          billingUnitId: { in: targetBillingUnitIds },
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
        }
      })

      // Get expenses from billing units
      expenses = await prisma.propertyExpense.findMany({
        where: {
          billingUnitId: { in: targetBillingUnitIds },
          chargeToOwner: true,
          liquidationId: null,
          date: {
            gte: startDate,
            lte: endDate,
          },
        }
      })
    } else {
      // Legacy mode: use PropertyBillingConfig
      const billingConfigs = await prisma.propertyBillingConfig.findMany({
        where: {
          ownerId,
          isActive: true,
        },
        include: {
          property: {
            select: { id: true, name: true },
          },
        },
      })

      if (billingConfigs.length === 0) {
        return NextResponse.json(
          { error: 'El propietario no tiene propiedades asignadas' },
          { status: 400 }
        )
      }

      // Build reservation query
      const reservationWhere: any = {
        status: { in: ['COMPLETED', 'CONFIRMED'] },
        liquidationId: null,
      }

      // If specific reservationIds provided, use those
      if (reservationIds && Array.isArray(reservationIds) && reservationIds.length > 0) {
        reservationWhere.id = { in: reservationIds }
      } else {
        // Otherwise, filter by billing configs and date range
        const configIds = propertyId
          ? billingConfigs.filter(bc => bc.property.id === propertyId).map(bc => bc.id)
          : billingConfigs.map(bc => bc.id)

        reservationWhere.billingConfigId = { in: configIds }
        reservationWhere.checkIn = {
          gte: startDate,
          lte: endDate,
        }
      }

      reservations = await prisma.reservation.findMany({
        where: reservationWhere,
        include: {
          billingConfig: true,
        },
      })

      expenses = await prisma.propertyExpense.findMany({
        where: {
          billingConfigId: { in: billingConfigs.map((bc) => bc.id) },
          date: {
            gte: startDate,
            lte: endDate,
          },
          chargeToOwner: true,
          liquidationId: null,
        },
      })

      // Use first config for commission settings in legacy mode
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

    // Calcular totales
    let totalIncome = new Decimal(0)
    let totalCommission = new Decimal(0)
    let totalCommissionVat = new Decimal(0)
    let totalCleaning = new Decimal(0)

    for (const reservation of reservations) {
      const hostEarnings = new Decimal(reservation.hostEarnings || 0)
      totalIncome = totalIncome.plus(hostEarnings)

      // Get config from reservation (for legacy) or use group/unit config
      let resCommissionType = commissionType
      let resCommissionValue = commissionValue
      let resCommissionVat = commissionVat
      let resCleaningType = cleaningType
      let resCleaningValue = cleaningValue

      if (reservation.billingConfig) {
        // Legacy mode with billingConfig
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
      // 1. Reserva (cleaningFee/cleaningAmount) - máxima prioridad si está rellena
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

      // Calcular IVA de comisión
      const commVat = commission.times(new Decimal(resCommissionVat || 21)).dividedBy(100)
      totalCommissionVat = totalCommissionVat.plus(commVat)
    }

    // Añadir cuota mensual (for GROUP or unit-based)
    if (monthlyFee && monthlyFee.greaterThan(0)) {
      totalCommission = totalCommission.plus(monthlyFee)
      if (monthlyFeeVat) {
        const feeVat = monthlyFee.times(new Decimal(monthlyFeeVat)).dividedBy(100)
        totalCommissionVat = totalCommissionVat.plus(feeVat)
      }
    }

    // Calcular gastos
    let totalExpenses = new Decimal(0)
    for (const expense of expenses) {
      totalExpenses = totalExpenses.plus(new Decimal(expense.amount || 0))
      totalExpenses = totalExpenses.plus(new Decimal(expense.vatAmount || 0))
    }

    // Calcular retención IRPF (usar retentionRate del propietario, o default según tipo)
    // Default: 15% para EMPRESA, 0% para PERSONA_FISICA
    const retentionRate = owner.retentionRate !== null
      ? new Decimal(owner.retentionRate)
      : (owner.type === 'EMPRESA' ? new Decimal(15) : new Decimal(0))
    let totalRetention = new Decimal(0)
    if (retentionRate.greaterThan(0)) {
      totalRetention = totalCommission.times(retentionRate).dividedBy(100)
    }

    // Calcular total a pagar al propietario
    const totalAmount = totalIncome
      .minus(totalCommission)
      .minus(totalCommissionVat)
      .minus(totalCleaning)
      .minus(totalExpenses)

    // Crear liquidación
    const liquidation = await prisma.liquidation.create({
      data: {
        userId,
        ownerId,
        year: parseInt(year),
        month: parseInt(month),
        totalIncome,
        totalCommission,
        totalCommissionVat,
        totalRetention,
        totalCleaning,
        totalExpenses,
        totalAmount,
        status: 'DRAFT',
        notes: JSON.stringify(metadata),
      },
    })

    // Asociar reservas y gastos a la liquidación
    if (reservations.length > 0) {
      await prisma.reservation.updateMany({
        where: { id: { in: reservations.map((r) => r.id) } },
        data: { liquidationId: liquidation.id },
      })
    }

    if (expenses.length > 0) {
      await prisma.propertyExpense.updateMany({
        where: { id: { in: expenses.map((e) => e.id) } },
        data: { liquidationId: liquidation.id },
      })
    }

    return NextResponse.json({
      success: true,
      liquidation: {
        id: liquidation.id,
        year: liquidation.year,
        month: liquidation.month,
        totalIncome: Number(totalIncome),
        totalCommission: Number(totalCommission),
        totalCommissionVat: Number(totalCommissionVat),
        totalRetention: Number(totalRetention),
        totalCleaning: Number(totalCleaning),
        totalExpenses: Number(totalExpenses),
        totalAmount: Number(totalAmount),
        reservationsCount: reservations.length,
        expensesCount: expenses.length,
      },
    })
  } catch (error) {
    console.error('Error generating liquidation:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
