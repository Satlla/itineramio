import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { Decimal } from '@prisma/client/runtime/library'

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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = { userId }

    if (year) where.year = parseInt(year)
    if (month) where.month = parseInt(month)
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
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()
    const { ownerId, propertyId, year, month, invoiceFormat, reservationIds } = body

    if (!ownerId || !year || !month) {
      return NextResponse.json(
        { error: 'Propietario, año y mes son requeridos' },
        { status: 400 }
      )
    }

    // Store format metadata for invoice generation
    const metadata = {
      invoiceFormat: invoiceFormat || 'detailed', // 'detailed' or 'grouped'
      propertyId: propertyId || null,
      reservationIds: reservationIds || null
    }

    // Verificar que no exista liquidación duplicada
    const existing = await prisma.liquidation.findFirst({
      where: {
        userId,
        ownerId,
        year: parseInt(year),
        month: parseInt(month),
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una liquidación para este propietario y período' },
        { status: 400 }
      )
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

    // Obtener las configuraciones de facturación del propietario
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

    // Fechas del período
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)

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
      // If propertyId provided, filter to that property only
      const configIds = propertyId
        ? billingConfigs.filter(bc => bc.property.id === propertyId).map(bc => bc.id)
        : billingConfigs.map(bc => bc.id)

      reservationWhere.billingConfigId = { in: configIds }
      reservationWhere.checkOut = {
        gte: startDate,
        lte: endDate,
      }
    }

    // Obtener reservas
    const reservations = await prisma.reservation.findMany({
      where: reservationWhere,
      include: {
        billingConfig: true,
      },
    })

    // Obtener gastos del período (repercutidos al propietario, sin liquidar)
    const expenses = await prisma.propertyExpense.findMany({
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

    // Calcular totales
    let totalIncome = new Decimal(0)
    let totalCommission = new Decimal(0)
    let totalCommissionVat = new Decimal(0)
    let totalCleaning = new Decimal(0)

    for (const reservation of reservations) {
      const config = reservation.billingConfig
      const hostEarnings = new Decimal(reservation.hostEarnings || 0)

      totalIncome = totalIncome.plus(hostEarnings)

      // Calcular comisión según tipo
      let commission = new Decimal(0)
      if (config.commissionType === 'PERCENTAGE') {
        commission = hostEarnings.times(new Decimal(config.commissionValue || 0)).dividedBy(100)
      } else if (config.commissionType === 'FIXED_PER_RESERVATION') {
        commission = new Decimal(config.commissionValue || 0)
      }
      // FIXED_MONTHLY se calcula después

      totalCommission = totalCommission.plus(commission)

      // Calcular IVA de comisión
      const commissionVat = commission.times(new Decimal(config.commissionVat || 21)).dividedBy(100)
      totalCommissionVat = totalCommissionVat.plus(commissionVat)

      // Calcular limpieza
      let cleaning = new Decimal(0)
      if (config.cleaningType === 'FIXED_PER_RESERVATION') {
        cleaning = new Decimal(config.cleaningValue || 0)
      } else if (config.cleaningType === 'PER_NIGHT') {
        cleaning = new Decimal(config.cleaningValue || 0).times(reservation.nights || 1)
      }
      totalCleaning = totalCleaning.plus(cleaning)
    }

    // Añadir comisiones mensuales fijas
    for (const config of billingConfigs) {
      if (config.commissionType === 'FIXED_MONTHLY') {
        const monthlyCommission = new Decimal(config.commissionValue || 0)
        totalCommission = totalCommission.plus(monthlyCommission)
        const commissionVat = monthlyCommission.times(new Decimal(config.commissionVat || 21)).dividedBy(100)
        totalCommissionVat = totalCommissionVat.plus(commissionVat)
      }

      // Añadir cuota mensual
      if (config.monthlyFee) {
        const fee = new Decimal(config.monthlyFee)
        totalCommission = totalCommission.plus(fee)
        if (config.monthlyFeeVat) {
          const feeVat = fee.times(new Decimal(config.monthlyFeeVat)).dividedBy(100)
          totalCommissionVat = totalCommissionVat.plus(feeVat)
        }
      }
    }

    // Calcular gastos
    let totalExpenses = new Decimal(0)
    for (const expense of expenses) {
      totalExpenses = totalExpenses.plus(new Decimal(expense.amount || 0))
      totalExpenses = totalExpenses.plus(new Decimal(expense.vatAmount || 0))
    }

    // Calcular retención IRPF (15% sobre comisión si el propietario es persona física)
    // La retención IRPF la aplica el propietario al gestor sobre los servicios prestados
    // El propietario retiene el 15% de la comisión y lo ingresa en Hacienda
    let totalRetention = new Decimal(0)
    if (owner.type === 'PERSONA_FISICA') {
      totalRetention = totalCommission.times(new Decimal(15)).dividedBy(100)
    }

    // Calcular total a pagar al propietario
    // totalAmount = ingresos - comisión - IVA comisión - limpieza - gastos
    // Nota: La retención NO afecta al totalAmount del propietario.
    // La retención indica cuánto del pago al gestor va a Hacienda vs al gestor directo:
    //   - Pago al gestor = comisión + IVA - retención
    //   - Pago a Hacienda = retención
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
        notes: JSON.stringify(metadata), // Store invoice format and other metadata
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
