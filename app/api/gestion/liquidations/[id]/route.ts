import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/liquidations/[id]
 * Obtener detalle de una liquidación
 */
export async function GET(
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

    const liquidation = await prisma.liquidation.findFirst({
      where: { id, userId },
      include: {
        owner: {
          select: {
            id: true,
            type: true,
            retentionRate: true,
            firstName: true,
            lastName: true,
            companyName: true,
            nif: true,
            cif: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            postalCode: true,
            country: true,
            iban: true,
          },
        },
        reservations: {
          include: {
            billingConfig: {
              select: {
                id: true,
                incomeReceiver: true,
                commissionType: true,
                commissionValue: true,
                commissionVat: true,
                cleaningType: true,
                cleaningValue: true,
                property: {
                  select: { id: true, name: true },
                },
              },
            },
            billingUnit: {
              select: {
                id: true,
                name: true,
                commissionType: true,
                commissionValue: true,
                commissionVat: true,
                cleaningType: true,
                cleaningValue: true,
                groupId: true,
                incomeReceiver: true,
              },
            },
          },
          orderBy: { checkIn: 'asc' },
        },
        expenses: {
          include: {
            billingConfig: {
              include: {
                property: {
                  select: { id: true, name: true },
                },
              },
            },
            billingUnit: {
              select: { id: true, name: true },
            },
          },
          orderBy: { date: 'asc' },
        },
      },
    })

    if (!liquidation) {
      return NextResponse.json(
        { error: 'Liquidación no encontrada' },
        { status: 404 }
      )
    }

    // Load BillingUnitGroup configs + managerConfig en paralelo
    const groupIds = [...new Set(
      liquidation.reservations
        .filter(r => r.billingUnit?.groupId)
        .map(r => r.billingUnit!.groupId!)
    )]
    const [groups, managerConfig] = await Promise.all([
      groupIds.length > 0
        ? prisma.billingUnitGroup.findMany({ where: { id: { in: groupIds } } })
        : Promise.resolve([]),
      prisma.userInvoiceConfig.findUnique({ where: { userId } }),
    ])
    const groupMap = new Map(groups.map(g => [g.id, g]))

    // If reservations have no billing config, look up from owner directly (old liquidations)
    const hasResBillingConfig = liquidation.reservations.some(r => r.billingUnit || r.billingConfig)
    let ownerFallbackConfig: any = null
    if (!hasResBillingConfig) {
      const ownerUnit = await prisma.billingUnit.findFirst({
        where: { ownerId: liquidation.owner.id },
        select: {
          incomeReceiver: true,
          commissionType: true,
          commissionValue: true,
          commissionVat: true,
          cleaningType: true,
          cleaningValue: true,
          groupId: true,
        },
      })
      if (ownerUnit?.groupId) {
        const ownerGroup = await prisma.billingUnitGroup.findUnique({
          where: { id: ownerUnit.groupId },
        })
        ownerFallbackConfig = ownerGroup || ownerUnit
      } else if (ownerUnit) {
        ownerFallbackConfig = ownerUnit
      } else {
        ownerFallbackConfig = await prisma.propertyBillingConfig.findFirst({
          where: { ownerId: liquidation.owner.id },
        })
      }
    }

    // Calculate per-reservation breakdown
    const enrichedReservations = liquidation.reservations.map((r) => {
      const hostEarnings = Number(r.hostEarnings)
      const nights = r.nights || 1

      // Resolve config: Group > Unit > BillingConfig (legacy) > Owner fallback
      const unit = r.billingUnit
      const group = unit?.groupId ? groupMap.get(unit.groupId) : null
      const legacyConfig = r.billingConfig

      // Commission: group > unit > billingConfig > owner fallback
      const commissionSource = group || unit || legacyConfig || ownerFallbackConfig
      const commissionType = commissionSource?.commissionType || 'PERCENTAGE'
      const commissionValue = Number(commissionSource?.commissionValue || 0)
      const commissionVatRate = Number(commissionSource?.commissionVat || 21)

      // Cleaning: unit (if value > 0) > group > billingConfig > owner fallback
      const unitCleaningValue = Number(unit?.cleaningValue || 0)
      const cleaningSource = unitCleaningValue > 0 ? unit : (group || unit || legacyConfig || ownerFallbackConfig)
      const cleaningType = cleaningSource?.cleaningType || 'FIXED_PER_RESERVATION'
      const cleaningValue = Number(cleaningSource?.cleaningValue || 0)

      // Calculate commission
      const commissionAmount = commissionType === 'PERCENTAGE'
        ? hostEarnings * commissionValue / 100
        : commissionValue

      // Calculate VAT on commission
      const commissionVatAmount = commissionAmount * commissionVatRate / 100

      // Calculate cleaning
      const cleaningAmount = cleaningType === 'PER_NIGHT'
        ? cleaningValue * nights
        : cleaningValue

      // Net to owner
      const netToOwner = hostEarnings - commissionAmount - commissionVatAmount - cleaningAmount

      // Property name: prefer billingUnit name, fall back to billingConfig property name
      const property = r.billingUnit?.name || r.billingConfig?.property?.name || 'N/A'

      return {
        id: r.id,
        confirmationCode: r.confirmationCode,
        guestName: r.guestName,
        checkIn: r.checkIn.toISOString(),
        checkOut: r.checkOut.toISOString(),
        nights: r.nights,
        platform: r.platform,
        hostEarnings: Math.round(hostEarnings * 100) / 100,
        pricePerNight: Math.round((hostEarnings / nights) * 100) / 100,
        commissionRate: commissionValue,
        commissionType,
        commissionAmount: Math.round(commissionAmount * 100) / 100,
        commissionVatRate,
        commissionVatAmount: Math.round(commissionVatAmount * 100) / 100,
        cleaningAmount: Math.round(cleaningAmount * 100) / 100,
        netToOwner: Math.round(netToOwner * 100) / 100,
        property,
      }
    })

    // Calculate occupancy stats
    const daysInMonth = new Date(liquidation.year, liquidation.month, 0).getDate()
    const totalNights = liquidation.reservations.reduce((sum, r) => sum + r.nights, 0)
    const occupancyRate = Math.min(Math.round((totalNights / daysInMonth) * 1000) / 10, 100)

    // Summary config resolution: group > unit > billingConfig > owner fallback
    const firstUnit = liquidation.reservations[0]?.billingUnit
    const firstGroup = firstUnit?.groupId ? groupMap.get(firstUnit.groupId) : null
    const firstBillingConfig = liquidation.reservations[0]?.billingConfig
    const summaryConfig = firstGroup || firstUnit || firstBillingConfig || ownerFallbackConfig
    const summaryCommissionType = summaryConfig?.commissionType || 'PERCENTAGE'
    const summaryCommissionValue = Number(summaryConfig?.commissionValue || 0)
    const summaryCommissionVatRate = Number(summaryConfig?.commissionVat || 21)
    const summaryCleaningType = summaryConfig?.cleaningType || 'FIXED_PER_RESERVATION'
    const summaryCleaningValue = Number(summaryConfig?.cleaningValue || 0)

    const ownerType = liquidation.owner.type
    const retentionRate = liquidation.owner.retentionRate !== null
      ? Number(liquidation.owner.retentionRate)
      : (ownerType === 'EMPRESA' ? 15 : 0)

    // Resolve incomeReceiver: stored > group > unit > billingConfig > owner fallback > default
    let incomeReceiver = liquidation.incomeReceiver
    if (!incomeReceiver) {
      incomeReceiver = (firstGroup as any)?.incomeReceiver
        || firstUnit?.incomeReceiver
        || (firstBillingConfig as any)?.incomeReceiver
        || ownerFallbackConfig?.incomeReceiver
        || 'MANAGER'
    }

    return NextResponse.json({
      liquidation: {
        id: liquidation.id,
        year: liquidation.year,
        month: liquidation.month,
        status: liquidation.status,
        owner: {
          id: liquidation.owner.id,
          type: liquidation.owner.type,
          name: liquidation.owner.type === 'EMPRESA'
            ? liquidation.owner.companyName
            : `${liquidation.owner.firstName} ${liquidation.owner.lastName}`,
          nif: liquidation.owner.type === 'EMPRESA'
            ? liquidation.owner.cif
            : liquidation.owner.nif,
          email: liquidation.owner.email,
          phone: liquidation.owner.phone,
          address: liquidation.owner.address,
          city: liquidation.owner.city,
          postalCode: liquidation.owner.postalCode,
          country: liquidation.owner.country,
          iban: liquidation.owner.iban,
        },
        totals: {
          totalIncome: Number(liquidation.totalIncome),
          totalCommission: Number(liquidation.totalCommission),
          totalCommissionVat: Number(liquidation.totalCommissionVat),
          totalCleaning: Number(liquidation.totalCleaning),
          totalExpenses: Number(liquidation.totalExpenses),
          totalAmount: Number(liquidation.totalAmount),
          totalRetention: Number(liquidation.totalRetention),
        },
        stats: {
          daysInMonth,
          totalNights,
          occupancyRate,
          commissionType: summaryCommissionType,
          commissionValue: summaryCommissionValue,
          commissionVatRate: summaryCommissionVatRate,
          cleaningType: summaryCleaningType,
          cleaningValue: summaryCleaningValue,
          ownerType,
          retentionRate,
        },
        incomeReceiver,
        invoiceId: liquidation.invoiceId,
        invoiceNumber: liquidation.invoiceNumber,
        invoiceDate: liquidation.invoiceDate?.toISOString(),
        notes: liquidation.notes,
        pdfUrl: liquidation.pdfUrl,
        paidAt: liquidation.paidAt?.toISOString(),
        createdAt: liquidation.createdAt.toISOString(),
        updatedAt: liquidation.updatedAt.toISOString(),
        reservations: enrichedReservations,
        expenses: liquidation.expenses.map((e) => ({
          id: e.id,
          date: e.date.toISOString(),
          concept: e.concept,
          category: e.category,
          amount: Number(e.amount),
          vatAmount: Number(e.vatAmount),
          property: e.billingUnit?.name || e.billingConfig?.property?.name || 'N/A',
        })),
      },
      managerConfig: managerConfig ? {
        businessName: managerConfig.businessName,
        nif: managerConfig.nif,
        address: managerConfig.address,
        city: managerConfig.city,
        postalCode: managerConfig.postalCode,
        country: managerConfig.country,
        email: managerConfig.email,
        phone: managerConfig.phone,
        logoUrl: managerConfig.logoUrl,
        iban: managerConfig.iban,
        bic: managerConfig.bic,
        bankName: managerConfig.bankName,
      } : null,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/gestion/liquidations/[id]
 * Actualizar liquidación (estado, notas, pago)
 */
export async function PUT(
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

    const liquidation = await prisma.liquidation.findFirst({
      where: { id, userId },
    })

    if (!liquidation) {
      return NextResponse.json(
        { error: 'Liquidación no encontrada' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { status, notes, paymentMethod } = body

    // Check if liquidation is linked to an invoice (locked)
    if (liquidation.invoiceId && status) {
      return NextResponse.json(
        { error: 'No se puede cambiar el estado de una liquidación vinculada a factura' },
        { status: 400 }
      )
    }

    // Validar transiciones de estado
    const validTransitions: Record<string, string[]> = {
      DRAFT: ['SENT', 'PAID', 'CANCELLED'],
      SENT: ['PAID', 'CANCELLED'],
      PAID: [],
      CANCELLED: [],
    }

    if (status && status !== liquidation.status) {
      if (!validTransitions[liquidation.status]?.includes(status)) {
        return NextResponse.json(
          { error: `No se puede cambiar de ${liquidation.status} a ${status}` },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}

    if (status) {
      updateData.status = status
      if (status === 'PAID') {
        updateData.paidAt = new Date()
      }
    }
    if (notes !== undefined) {
      updateData.notes = notes
    } else if (paymentMethod !== undefined) {
      // Merge paymentMethod into existing notes JSON
      let notesObj: Record<string, unknown> = {}
      if (liquidation.notes) {
        try { notesObj = JSON.parse(liquidation.notes) } catch { /* not JSON */ }
      }
      notesObj.paymentMethod = paymentMethod
      updateData.notes = JSON.stringify(notesObj)
    }

    const updated = await prisma.liquidation.update({
      where: { id },
      data: updateData,
    })

    // When marking PAID without a linked invoice: mark all associated reservations as COMPLETED
    if (status === 'PAID' && !liquidation.invoiceId) {
      await prisma.reservation.updateMany({
        where: { liquidationId: id },
        data: { status: 'COMPLETED' },
      })
    }

    return NextResponse.json({
      success: true,
      liquidation: {
        id: updated.id,
        status: updated.status,
        notes: updated.notes,
        invoiceId: updated.invoiceId,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/gestion/liquidations/[id]
 * Eliminar liquidación (solo en DRAFT o CANCELLED)
 */
export async function DELETE(
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

    const liquidation = await prisma.liquidation.findFirst({
      where: { id, userId },
    })

    if (!liquidation) {
      return NextResponse.json(
        { error: 'Liquidación no encontrada' },
        { status: 404 }
      )
    }

    if (!['DRAFT', 'CANCELLED'].includes(liquidation.status)) {
      return NextResponse.json(
        { error: 'Solo se pueden eliminar liquidaciones en borrador o canceladas' },
        { status: 400 }
      )
    }

    // Desasociar reservas y gastos
    await prisma.reservation.updateMany({
      where: { liquidationId: id },
      data: { liquidationId: null },
    })

    await prisma.propertyExpense.updateMany({
      where: { liquidationId: id },
      data: { liquidationId: null },
    })

    // Eliminar liquidación
    await prisma.liquidation.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
