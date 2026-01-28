import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { getOrCreateDefaultSeries } from '@/lib/invoice-numbering'

/**
 * POST /api/gestion/invoices/from-reservations
 * Create a draft invoice from selected reservations
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()
    const {
      reservationIds,
      invoiceDetailLevel = 'DETAILED', // 'DETAILED' = one line per reservation, 'SUMMARY' = one line total
      issueDate,
      dueDate,
      notes,
      includeCleaningAsManager = true // Whether to include cleaning fee as manager income
    } = body

    if (!reservationIds || reservationIds.length === 0) {
      return NextResponse.json(
        { error: 'Selecciona al menos una reserva' },
        { status: 400 }
      )
    }

    // Get reservations with their billing config and owner
    const reservations = await prisma.reservation.findMany({
      where: {
        id: { in: reservationIds },
        userId,
        invoiced: false
      },
      include: {
        billingConfig: {
          include: {
            property: {
              select: {
                id: true,
                name: true
              }
            },
            owner: true
          }
        }
      },
      orderBy: { checkIn: 'asc' }
    })

    if (reservations.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron reservas válidas para facturar' },
        { status: 400 }
      )
    }

    // Verify all reservations belong to the same owner
    const ownerIds = new Set(reservations.map(r => r.billingConfig.ownerId))
    if (ownerIds.size > 1) {
      return NextResponse.json(
        { error: 'Todas las reservas deben pertenecer al mismo propietario' },
        { status: 400 }
      )
    }

    const ownerId = reservations[0].billingConfig.ownerId
    if (!ownerId) {
      return NextResponse.json(
        { error: 'Las reservas no tienen propietario asignado' },
        { status: 400 }
      )
    }

    // Get the billing config for commission info
    const billingConfig = reservations[0].billingConfig
    const owner = billingConfig.owner
    const commissionValue = Number(billingConfig.commissionValue) || 0
    const commissionVat = Number(billingConfig.commissionVat) || 21
    const defaultVatRate = Number(billingConfig.defaultVatRate) || 21
    // Retención automática: 15% si el propietario es EMPRESA, 0% si es PERSONA_FISICA
    const defaultRetentionRate = owner?.type === 'EMPRESA' ? 15 : 0

    // Get or create default series
    let seriesId: string
    try {
      seriesId = await getOrCreateDefaultSeries(userId, 'STANDARD')
    } catch (err) {
      return NextResponse.json(
        { error: 'Configure su perfil de gestor y series de facturación primero' },
        { status: 400 }
      )
    }

    // Calculate invoice items based on detail level
    let items: any[] = []
    let subtotal = 0
    let totalVat = 0
    let totalRetention = 0

    if (invoiceDetailLevel === 'DETAILED') {
      // One line per reservation
      items = reservations.map((r, index) => {
        const managerAmount = Number(r.managerAmount) || 0
        const cleaningAmount = Number(r.cleaningAmount) || 0
        const baseAmount = managerAmount - cleaningAmount // Commission without cleaning

        // Commission line
        const lineBase = baseAmount
        const lineVat = lineBase * (defaultVatRate / 100)
        const lineRetention = lineBase * (defaultRetentionRate / 100)

        subtotal += lineBase
        totalVat += lineVat
        totalRetention += lineRetention

        const checkIn = new Date(r.checkIn)
        const checkOut = new Date(r.checkOut)

        return {
          concept: `Comisión gestión ${r.billingConfig.property.name}`,
          description: `${r.guestName} - ${checkIn.toLocaleDateString('es-ES')} al ${checkOut.toLocaleDateString('es-ES')} (${r.nights} noches)`,
          quantity: 1,
          unitPrice: lineBase,
          vatRate: defaultVatRate,
          retentionRate: defaultRetentionRate,
          total: lineBase + lineVat,
          reservationId: r.id,
          periodStart: checkIn,
          periodEnd: checkOut,
          order: index
        }
      })

      // Add cleaning fee lines if manager receives them
      if (includeCleaningAsManager) {
        const cleaningReservations = reservations.filter(r => Number(r.cleaningAmount) > 0)
        if (cleaningReservations.length > 0) {
          const totalCleaning = cleaningReservations.reduce((sum, r) => sum + (Number(r.cleaningAmount) || 0), 0)
          const cleaningVat = totalCleaning * (defaultVatRate / 100)
          const cleaningRetention = totalCleaning * (defaultRetentionRate / 100)

          subtotal += totalCleaning
          totalVat += cleaningVat
          totalRetention += cleaningRetention

          items.push({
            concept: 'Servicios de limpieza',
            description: `${cleaningReservations.length} reservas`,
            quantity: 1,
            unitPrice: totalCleaning,
            vatRate: defaultVatRate,
            retentionRate: defaultRetentionRate,
            total: totalCleaning + cleaningVat,
            order: items.length
          })
        }
      }
    } else {
      // SUMMARY: One line with total
      const periodStart = new Date(Math.min(...reservations.map(r => new Date(r.checkIn).getTime())))
      const periodEnd = new Date(Math.max(...reservations.map(r => new Date(r.checkOut).getTime())))

      let totalManagerAmount = 0
      let totalCleaningAmount = 0
      let totalNights = 0

      for (const r of reservations) {
        totalManagerAmount += Number(r.managerAmount) || 0
        totalCleaningAmount += Number(r.cleaningAmount) || 0
        totalNights += r.nights
      }

      const lineBase = totalManagerAmount
      const lineVat = lineBase * (defaultVatRate / 100)
      const lineRetention = lineBase * (defaultRetentionRate / 100)

      subtotal = lineBase
      totalVat = lineVat
      totalRetention = lineRetention

      const propertyName = billingConfig.property.name

      items.push({
        concept: `Comisión gestión ${propertyName}`,
        description: `${reservations.length} reservas, ${totalNights} noches (${periodStart.toLocaleDateString('es-ES')} - ${periodEnd.toLocaleDateString('es-ES')})`,
        quantity: 1,
        unitPrice: lineBase,
        vatRate: defaultVatRate,
        retentionRate: defaultRetentionRate,
        total: lineBase + lineVat,
        periodStart,
        periodEnd,
        order: 0
      })
    }

    // Calculate final totals
    const total = subtotal + totalVat - totalRetention
    const avgRetentionRate = subtotal > 0 ? (totalRetention / subtotal) * 100 : 0

    // Create the invoice (number assigned on emission, not draft creation)
    const invoice = await prisma.$transaction(async (tx) => {
      // Create invoice as draft (no number yet)
      const newInvoice = await tx.clientInvoice.create({
        data: {
          userId,
          ownerId,
          seriesId,
          // number and fullNumber will be assigned when issued
          issueDate: issueDate ? new Date(issueDate) : new Date(),
          dueDate: dueDate ? new Date(dueDate) : null,
          subtotal,
          totalVat,
          retentionRate: avgRetentionRate,
          retentionAmount: totalRetention,
          total,
          status: 'DRAFT',
          isLocked: false,
          notes: notes || null,
          items: {
            create: items.map(item => ({
              concept: item.concept,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              vatRate: item.vatRate,
              retentionRate: item.retentionRate,
              total: item.total,
              reservationId: item.reservationId || null,
              periodStart: item.periodStart || null,
              periodEnd: item.periodEnd || null,
              order: item.order
            }))
          }
        },
        include: {
          owner: {
            select: {
              id: true,
              type: true,
              firstName: true,
              lastName: true,
              companyName: true
            }
          },
          series: {
            select: {
              id: true,
              name: true,
              prefix: true
            }
          },
          items: true
        }
      })

      // Mark reservations as invoiced
      await tx.reservation.updateMany({
        where: { id: { in: reservationIds } },
        data: { invoiced: true }
      })

      // Link reservations to invoice items if detailed
      if (invoiceDetailLevel === 'DETAILED') {
        for (const item of newInvoice.items) {
          if (item.reservationId) {
            await tx.reservation.update({
              where: { id: item.reservationId },
              data: { invoiceItemId: item.id }
            })
          }
        }
      }

      return newInvoice
    })

    return NextResponse.json({
      invoice: {
        id: invoice.id,
        number: invoice.number,
        fullNumber: invoice.fullNumber,
        issueDate: invoice.issueDate.toISOString(),
        dueDate: invoice.dueDate?.toISOString(),
        subtotal: Number(invoice.subtotal),
        totalVat: Number(invoice.totalVat),
        retentionRate: Number(invoice.retentionRate),
        retentionAmount: Number(invoice.retentionAmount),
        total: Number(invoice.total),
        status: invoice.status,
        isLocked: invoice.isLocked,
        owner: invoice.owner,
        series: invoice.series,
        items: invoice.items.map(i => ({
          id: i.id,
          concept: i.concept,
          description: i.description,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          vatRate: Number(i.vatRate),
          retentionRate: Number(i.retentionRate),
          total: Number(i.total),
          reservationId: i.reservationId
        })),
        reservationCount: reservations.length
      }
    })
  } catch (error) {
    console.error('Error creating invoice from reservations:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
