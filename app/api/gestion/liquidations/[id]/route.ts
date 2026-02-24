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
              include: {
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

    // Load BillingUnitGroup configs if any reservation has a billingUnit with groupId
    const groupIds = [...new Set(
      liquidation.reservations
        .filter(r => r.billingUnit?.groupId)
        .map(r => r.billingUnit!.groupId!)
    )]
    const groups = groupIds.length > 0
      ? await prisma.billingUnitGroup.findMany({ where: { id: { in: groupIds } } })
      : []
    const groupMap = new Map(groups.map(g => [g.id, g]))

    // Calculate per-reservation breakdown
    const enrichedReservations = liquidation.reservations.map((r) => {
      const hostEarnings = Number(r.hostEarnings)
      const nights = r.nights || 1

      // Resolve config: Commission from Group > Unit; Cleaning from Unit (if set) > Group
      const unit = r.billingUnit
      const group = unit?.groupId ? groupMap.get(unit.groupId) : null

      // Commission: group takes precedence (same management fee for all units)
      const commissionSource = group || unit
      const commissionType = commissionSource?.commissionType || 'PERCENTAGE'
      const commissionValue = Number(commissionSource?.commissionValue || 0)
      const commissionVatRate = Number(commissionSource?.commissionVat || 21)

      // Cleaning: unit takes precedence if it has a value > 0, otherwise group
      const unitCleaningValue = Number(unit?.cleaningValue || 0)
      const cleaningSource = unitCleaningValue > 0 ? unit : (group || unit)
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

    // Get first config for summary display (they should all match for same owner)
    const firstUnit = liquidation.reservations[0]?.billingUnit
    const firstGroup = firstUnit?.groupId ? groupMap.get(firstUnit.groupId) : null
    const summaryConfig = firstGroup || firstUnit

    const ownerType = liquidation.owner.type
    // Use owner's retentionRate if set, otherwise default (15% for EMPRESA, 0% for PERSONA_FISICA)
    const retentionRate = liquidation.owner.retentionRate !== null
      ? Number(liquidation.owner.retentionRate)
      : (ownerType === 'EMPRESA' ? 15 : 0)

    // Obtener configuración del gestor para datos de factura
    const managerConfig = await prisma.userInvoiceConfig.findUnique({
      where: { userId },
    })

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
          commissionType: summaryConfig?.commissionType || 'PERCENTAGE',
          commissionValue: Number(summaryConfig?.commissionValue || 0),
          commissionVatRate: Number(summaryConfig?.commissionVat || 21),
          cleaningType: summaryConfig?.cleaningType || 'FIXED_PER_RESERVATION',
          cleaningValue: Number(summaryConfig?.cleaningValue || 0),
          ownerType,
          retentionRate,
        },
        invoiceId: liquidation.invoiceId,
        invoiceNumber: liquidation.invoiceNumber,
        invoiceDate: liquidation.invoiceDate?.toISOString(),
        notes: liquidation.notes,
        pdfUrl: liquidation.pdfUrl,
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
          property: e.billingConfig?.property?.name || 'N/A',
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
    console.error('Error fetching liquidation:', error)
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
    const { status, notes } = body

    // Check if liquidation is linked to an invoice (locked)
    if (liquidation.invoiceId && status) {
      return NextResponse.json(
        { error: 'No se puede cambiar el estado de una liquidación vinculada a factura' },
        { status: 400 }
      )
    }

    // Validar transiciones de estado (DRAFT -> SENT -> CANCELLED)
    // Note: Payment is tracked on the invoice, not the liquidation
    const validTransitions: Record<string, string[]> = {
      DRAFT: ['SENT', 'CANCELLED'],
      SENT: ['CANCELLED'],
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

    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes

    const updated = await prisma.liquidation.update({
      where: { id },
      data: updateData,
    })

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
    console.error('Error updating liquidation:', error)
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
    console.error('Error deleting liquidation:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
