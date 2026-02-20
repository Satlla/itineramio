import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/invoices/[id]
 * Get a single invoice with full details
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

    const invoice = await prisma.clientInvoice.findFirst({
      where: {
        id,
        userId
      },
      include: {
        owner: true,
        series: true,
        rectifies: {
          select: {
            id: true,
            fullNumber: true,
            total: true,
            status: true
          }
        },
        rectifiedBy: {
          select: {
            id: true,
            fullNumber: true,
            total: true,
            status: true,
            rectifyingType: true
          }
        },
        items: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    // Get manager config for issuer info
    const managerConfig = await prisma.userInvoiceConfig.findUnique({
      where: { userId }
    })

    return NextResponse.json({
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
        bankName: managerConfig.bankName,
        bic: managerConfig.bic,
        paymentMethods: managerConfig.paymentMethods,
        defaultPaymentMethod: managerConfig.defaultPaymentMethod,
        bizumPhone: managerConfig.bizumPhone,
        paypalEmail: managerConfig.paypalEmail
      } : null,
      invoice: {
        id: invoice.id,
        number: invoice.number,
        fullNumber: invoice.fullNumber,
        issueDate: invoice.issueDate.toISOString(),
        issuedAt: invoice.issuedAt?.toISOString(),
        dueDate: invoice.dueDate?.toISOString(),
        subtotal: Number(invoice.subtotal),
        totalVat: Number(invoice.totalVat),
        retentionRate: Number(invoice.retentionRate),
        retentionAmount: Number(invoice.retentionAmount),
        total: Number(invoice.total),
        propertyId: invoice.propertyId,
        periodMonth: invoice.periodMonth,
        periodYear: invoice.periodYear,
        status: invoice.status,
        isLocked: invoice.isLocked,
        isRectifying: invoice.isRectifying,
        rectifyingType: invoice.rectifyingType,
        rectifyingReason: invoice.rectifyingReason,
        originalTotal: invoice.originalTotal ? Number(invoice.originalTotal) : null,
        paymentMethodUsed: invoice.paymentMethodUsed,
        pdfUrl: invoice.pdfUrl,
        notes: invoice.notes,
        createdAt: invoice.createdAt.toISOString(),
        updatedAt: invoice.updatedAt.toISOString(),
        owner: {
          ...invoice.owner,
          // Convert any Decimal fields
        },
        series: {
          id: invoice.series.id,
          name: invoice.series.name,
          prefix: invoice.series.prefix,
          type: invoice.series.type
        },
        rectifies: invoice.rectifies ? {
          id: invoice.rectifies.id,
          fullNumber: invoice.rectifies.fullNumber,
          total: Number(invoice.rectifies.total),
          status: invoice.rectifies.status
        } : null,
        rectifiedBy: invoice.rectifiedBy.map(r => ({
          id: r.id,
          fullNumber: r.fullNumber,
          total: Number(r.total),
          status: r.status,
          rectifyingType: r.rectifyingType
        })),
        items: invoice.items.map(i => ({
          id: i.id,
          concept: i.concept,
          description: i.description,
          quantity: Number(i.quantity),
          unitPrice: Math.round(Number(i.unitPrice) * 100) / 100,
          vatRate: Number(i.vatRate),
          retentionRate: Number(i.retentionRate),
          total: Math.round(Number(i.total) * 100) / 100,
          order: i.order,
          reservationId: i.reservationId
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/gestion/invoices/[id]
 * Update a draft invoice (only DRAFT status allowed)
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

    // Get existing invoice
    const existing = await prisma.clientInvoice.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    // Check if invoice is editable
    if (existing.isLocked || existing.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Solo se pueden editar facturas en estado borrador' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      ownerId,
      seriesId,
      fullNumber,
      issueDate,
      dueDate,
      notes,
      items,
      paymentMethodUsed
    } = body

    // Validate owner if changing
    if (ownerId && ownerId !== existing.ownerId) {
      const owner = await prisma.propertyOwner.findFirst({
        where: {
          id: ownerId,
          userId
        }
      })

      if (!owner) {
        return NextResponse.json(
          { error: 'Cliente no encontrado' },
          { status: 404 }
        )
      }
    }

    // Validate series if changing
    if (seriesId && seriesId !== existing.seriesId) {
      const series = await prisma.invoiceSeries.findFirst({
        where: {
          id: seriesId,
          invoiceConfig: { userId }
        }
      })

      if (!series) {
        return NextResponse.json(
          { error: 'Serie de facturación no encontrada' },
          { status: 404 }
        )
      }
    }

    // Calculate new totals if items provided
    let subtotal = Number(existing.subtotal)
    let totalVat = Number(existing.totalVat)
    let total = Number(existing.total)
    let processedItems: any[] | undefined

    let totalRetention = Number(existing.retentionAmount) || 0

    if (items && items.length > 0) {
      subtotal = 0
      totalVat = 0
      totalRetention = 0

      processedItems = items.map((item: any, index: number) => {
        const quantity = Number(item.quantity) || 1
        const unitPrice = Math.round((Number(item.unitPrice) || 0) * 100) / 100
        const vatRate = Number(item.vatRate) || 21
        const retentionRate = Number(item.retentionRate) || 0
        const lineTotal = Math.round(quantity * unitPrice * 100) / 100
        const lineVat = Math.round(lineTotal * (vatRate / 100) * 100) / 100
        const lineRetention = Math.round(lineTotal * (retentionRate / 100) * 100) / 100

        subtotal += lineTotal
        totalVat += lineVat
        totalRetention += lineRetention

        return {
          concept: item.concept,
          description: item.description || null,
          quantity,
          unitPrice,
          vatRate,
          retentionRate,
          total: Math.round((lineTotal + lineVat) * 100) / 100,
          order: index
        }
      })

      subtotal = Math.round(subtotal * 100) / 100
      totalVat = Math.round(totalVat * 100) / 100
      totalRetention = Math.round(totalRetention * 100) / 100
      total = Math.round((subtotal + totalVat - totalRetention) * 100) / 100
    }

    // Update invoice
    const invoice = await prisma.$transaction(async (tx) => {
      // Delete existing items if new ones provided
      if (processedItems) {
        await tx.clientInvoiceItem.deleteMany({
          where: { invoiceId: id }
        })
      }

      // Update invoice
      return tx.clientInvoice.update({
        where: { id },
        data: {
          ownerId: ownerId || existing.ownerId,
          seriesId: seriesId || existing.seriesId,
          fullNumber: fullNumber !== undefined ? fullNumber : existing.fullNumber,
          issueDate: issueDate ? new Date(issueDate) : existing.issueDate,
          dueDate: dueDate ? new Date(dueDate) : (dueDate === null ? null : existing.dueDate),
          subtotal,
          totalVat,
          retentionAmount: totalRetention,
          total,
          paymentMethodUsed: paymentMethodUsed !== undefined ? paymentMethodUsed : existing.paymentMethodUsed,
          notes: notes !== undefined ? notes : existing.notes,
          ...(processedItems ? {
            items: {
              create: processedItems
            }
          } : {})
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
          items: {
            orderBy: { order: 'asc' }
          }
        }
      })
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
        total: Number(invoice.total),
        status: invoice.status,
        isLocked: invoice.isLocked,
        owner: invoice.owner,
        series: invoice.series,
        items: invoice.items.map(i => ({
          id: i.id,
          concept: i.concept,
          quantity: Number(i.quantity),
          unitPrice: Math.round(Number(i.unitPrice) * 100) / 100,
          vatRate: Number(i.vatRate),
          total: Math.round(Number(i.total) * 100) / 100
        }))
      }
    })
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/gestion/invoices/[id]
 * Delete a draft invoice (only DRAFT status allowed)
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

    // Get existing invoice
    const existing = await prisma.clientInvoice.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    // Check if invoice can be deleted
    if (existing.isLocked || existing.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Solo se pueden eliminar facturas en estado borrador' },
        { status: 400 }
      )
    }

    // Delete invoice (items will cascade)
    await prisma.clientInvoice.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
