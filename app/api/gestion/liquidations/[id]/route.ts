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
        },
        invoiceNumber: liquidation.invoiceNumber,
        invoiceDate: liquidation.invoiceDate?.toISOString(),
        paidAt: liquidation.paidAt?.toISOString(),
        paymentMethod: liquidation.paymentMethod,
        paymentReference: liquidation.paymentReference,
        notes: liquidation.notes,
        pdfUrl: liquidation.pdfUrl,
        createdAt: liquidation.createdAt.toISOString(),
        updatedAt: liquidation.updatedAt.toISOString(),
        reservations: liquidation.reservations.map((r) => ({
          id: r.id,
          confirmationCode: r.confirmationCode,
          guestName: r.guestName,
          checkIn: r.checkIn.toISOString(),
          checkOut: r.checkOut.toISOString(),
          nights: r.nights,
          platform: r.platform,
          hostEarnings: Number(r.hostEarnings),
          property: r.billingConfig?.property?.name || 'N/A',
        })),
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
    const { status, notes, paymentMethod, paymentReference, paidAt } = body

    // Validar transiciones de estado
    const validTransitions: Record<string, string[]> = {
      DRAFT: ['GENERATED', 'CANCELLED'],
      GENERATED: ['SENT', 'PAID', 'CANCELLED'],
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

    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod
    if (paymentReference !== undefined) updateData.paymentReference = paymentReference
    if (paidAt !== undefined) updateData.paidAt = paidAt ? new Date(paidAt) : null

    // Si se marca como pagada, registrar fecha
    if (status === 'PAID' && !liquidation.paidAt) {
      updateData.paidAt = new Date()
    }

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
        paidAt: updated.paidAt?.toISOString(),
        paymentMethod: updated.paymentMethod,
        paymentReference: updated.paymentReference,
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
