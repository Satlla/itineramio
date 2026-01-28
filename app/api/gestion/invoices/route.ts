import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { getOrCreateDefaultSeries, getNextInvoiceNumber } from '@/lib/invoice-numbering'

/**
 * GET /api/gestion/invoices
 * List all client invoices
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const status = searchParams.get('status')
    const ownerId = searchParams.get('ownerId')
    const type = searchParams.get('type') // 'normal' | 'rectifying' | 'all'

    const where: any = {
      userId,
      issueDate: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1)
      }
    }

    if (status) {
      where.status = status
    }

    if (ownerId) {
      where.ownerId = ownerId
    }

    if (type === 'normal') {
      where.isRectifying = false
    } else if (type === 'rectifying') {
      where.isRectifying = true
    }

    const invoices = await prisma.clientInvoice.findMany({
      where,
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
            prefix: true,
            type: true
          }
        },
        rectifies: {
          select: {
            id: true,
            fullNumber: true
          }
        },
        rectifiedBy: {
          select: {
            id: true,
            fullNumber: true
          }
        },
        items: {
          select: {
            concept: true,
            total: true
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: [
        { issueDate: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    const formattedInvoices = invoices.map(inv => ({
      id: inv.id,
      number: inv.number,
      fullNumber: inv.fullNumber,
      issueDate: inv.issueDate.toISOString(),
      issuedAt: inv.issuedAt?.toISOString(),
      dueDate: inv.dueDate?.toISOString(),
      subtotal: Number(inv.subtotal),
      totalVat: Number(inv.totalVat),
      retentionRate: Number(inv.retentionRate),
      retentionAmount: Number(inv.retentionAmount),
      total: Number(inv.total),
      status: inv.status,
      isLocked: inv.isLocked,
      isRectifying: inv.isRectifying,
      rectifyingType: inv.rectifyingType,
      rectifyingReason: inv.rectifyingReason,
      originalTotal: inv.originalTotal ? Number(inv.originalTotal) : null,
      paymentMethodUsed: inv.paymentMethodUsed,
      owner: inv.owner,
      series: inv.series,
      rectifies: inv.rectifies,
      rectifiedBy: inv.rectifiedBy,
      items: inv.items.map(i => ({
        concept: i.concept,
        total: Number(i.total)
      }))
    }))

    return NextResponse.json({ invoices: formattedInvoices })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/gestion/invoices
 * Create a new draft invoice
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
      ownerId,
      seriesId,
      issueDate,
      dueDate,
      notes,
      items,
      paymentMethodUsed,
      applyRetention,
      retentionRate: inputRetentionRate
    } = body

    // Validate required fields
    if (!ownerId) {
      return NextResponse.json(
        { error: 'Cliente requerido' },
        { status: 400 }
      )
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Debe incluir al menos una línea de factura' },
        { status: 400 }
      )
    }

    // Verify owner belongs to user
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

    // Get series (use provided or default)
    let finalSeriesId = seriesId
    if (!finalSeriesId) {
      try {
        finalSeriesId = await getOrCreateDefaultSeries(userId, 'STANDARD')
      } catch (err) {
        return NextResponse.json(
          { error: 'Configure su perfil de gestor y series de facturación primero' },
          { status: 400 }
        )
      }
    }

    // Verify series belongs to user
    const series = await prisma.invoiceSeries.findFirst({
      where: {
        id: finalSeriesId,
        invoiceConfig: { userId }
      }
    })

    if (!series) {
      return NextResponse.json(
        { error: 'Serie de facturación no encontrada' },
        { status: 404 }
      )
    }

    // Calculate totals with per-line retentions
    let subtotal = 0
    let totalVat = 0
    let totalRetention = 0

    const processedItems = items.map((item: any, index: number) => {
      const quantity = Number(item.quantity) || 1
      const unitPrice = Number(item.unitPrice) || 0
      const vatRate = Number(item.vatRate) || 21
      const retentionRate = Number(item.retentionRate) || 0
      const lineBase = quantity * unitPrice
      const lineVat = lineBase * (vatRate / 100)
      const lineRetention = lineBase * (retentionRate / 100)

      subtotal += lineBase
      totalVat += lineVat
      totalRetention += lineRetention

      return {
        concept: item.concept,
        description: item.description || null,
        quantity,
        unitPrice,
        vatRate,
        retentionRate,
        total: lineBase + lineVat,
        order: index
      }
    })

    // Total retention is sum of all line retentions
    // retentionRate stored is an average for reference (or 0 if mixed)
    const avgRetentionRate = subtotal > 0 ? (totalRetention / subtotal) * 100 : 0
    const total = subtotal + totalVat - totalRetention

    // Get next invoice number immediately (even for drafts)
    const numberResult = await getNextInvoiceNumber(finalSeriesId)

    // Create draft invoice with number assigned
    const invoice = await prisma.clientInvoice.create({
      data: {
        userId,
        ownerId,
        seriesId: finalSeriesId,
        number: numberResult.number,
        fullNumber: numberResult.fullNumber,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        subtotal,
        totalVat,
        retentionRate: avgRetentionRate,
        retentionAmount: totalRetention,
        total,
        status: 'DRAFT',
        isLocked: false,
        paymentMethodUsed: paymentMethodUsed || null,
        notes: notes || null,
        items: {
          create: processedItems
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
          total: Number(i.total)
        }))
      }
    })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
