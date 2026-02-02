import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { getNextInvoiceNumber, previewNextNumber, formatInvoiceNumber } from '@/lib/invoice-numbering'

/**
 * GET /api/gestion/invoices/[id]/issue
 * Preview what number would be assigned if issued
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
        series: true
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    if (invoice.status !== 'DRAFT' && invoice.status !== 'PROFORMA') {
      return NextResponse.json(
        { error: 'Esta factura ya ha sido emitida' },
        { status: 400 }
      )
    }

    const nextNumber = await previewNextNumber(invoice.seriesId)

    return NextResponse.json({
      canIssue: true,
      nextNumber,
      suggestedNumber: invoice.series.currentNumber + 1,
      seriesName: invoice.series.name,
      seriesPrefix: invoice.series.prefix,
      seriesYear: invoice.series.year,
      canEditNumber: true
    })
  } catch (error) {
    console.error('Error previewing invoice issue:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/gestion/invoices/[id]/issue
 * Validate if a custom number is available
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
    const body = await request.json()
    const { customNumber } = body

    if (!customNumber || customNumber < 1) {
      return NextResponse.json(
        { error: 'Número de factura inválido' },
        { status: 400 }
      )
    }

    const invoice = await prisma.clientInvoice.findFirst({
      where: { id, userId },
      include: { series: true }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    // Build the full number that would be used
    const fullNumber = formatInvoiceNumber(
      invoice.series.prefix,
      invoice.series.year,
      customNumber
    )

    // Check if this number already exists in the same series
    const existing = await prisma.clientInvoice.findFirst({
      where: {
        seriesId: invoice.seriesId,
        fullNumber,
        id: { not: id } // Exclude current invoice
      }
    })

    if (existing) {
      return NextResponse.json({
        available: false,
        error: `Ya existe una factura con el número ${fullNumber}`,
        existingId: existing.id
      })
    }

    // Check correlation warning (not blocking, just a warning)
    const nextExpected = invoice.series.currentNumber + 1
    const breaksCorrelation = customNumber !== nextExpected

    return NextResponse.json({
      available: true,
      fullNumber,
      breaksCorrelation,
      correlationWarning: breaksCorrelation
        ? `El número correlativo sería ${nextExpected}. Usar ${customNumber} dejará un hueco.`
        : null
    })
  } catch (error) {
    console.error('Error validating invoice number:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/gestion/invoices/[id]/issue
 * Issue a draft invoice (assign number, lock it)
 * Accepts optional customNumber to override automatic numbering
 */
export async function POST(
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

    // Parse body for optional custom number
    let customNumber: number | null = null
    try {
      const body = await request.json()
      customNumber = body.customNumber ? parseInt(body.customNumber) : null
    } catch {
      // No body provided, use automatic numbering
    }

    // Get invoice with validation
    const invoice = await prisma.clientInvoice.findFirst({
      where: {
        id,
        userId
      },
      include: {
        series: true,
        items: true,
        owner: {
          select: {
            id: true,
            documentType: true,
            type: true,
            firstName: true,
            lastName: true,
            companyName: true
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    // Check owner's document type
    const ownerDocType = invoice.owner?.documentType || 'INVOICE'
    if (ownerDocType === 'NONE') {
      return NextResponse.json(
        { error: 'Este cliente está configurado para no generar documentos. Solo puede ver el resumen.' },
        { status: 400 }
      )
    }

    // Validate status
    if (invoice.status !== 'DRAFT' && invoice.status !== 'PROFORMA') {
      return NextResponse.json(
        { error: 'Solo se pueden emitir facturas en estado borrador o proforma' },
        { status: 400 }
      )
    }

    // Validate has items
    if (invoice.items.length === 0) {
      return NextResponse.json(
        { error: 'La factura debe tener al menos una línea' },
        { status: 400 }
      )
    }

    // Validate total is positive
    if (Number(invoice.total) <= 0) {
      return NextResponse.json(
        { error: 'El total de la factura debe ser positivo' },
        { status: 400 }
      )
    }

    // Check for duplicate: if this invoice has a period, verify no other ISSUED/PAID invoice exists
    // for the same owner + month + year
    if (invoice.periodYear && invoice.periodMonth && invoice.ownerId) {
      const existingIssuedInvoice = await prisma.clientInvoice.findFirst({
        where: {
          userId,
          ownerId: invoice.ownerId,
          periodYear: invoice.periodYear,
          periodMonth: invoice.periodMonth,
          status: { in: ['ISSUED', 'PAID'] },
          isRectifying: false,
          id: { not: id } // Exclude current invoice
        },
        select: {
          id: true,
          fullNumber: true,
          status: true,
          total: true,
          issuedAt: true
        }
      })

      if (existingIssuedInvoice) {
        const monthNames = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
        return NextResponse.json(
          {
            error: `Ya existe una factura emitida para este propietario en ${monthNames[invoice.periodMonth]} ${invoice.periodYear}: ${existingIssuedInvoice.fullNumber}`,
            duplicateInvoice: {
              id: existingIssuedInvoice.id,
              fullNumber: existingIssuedInvoice.fullNumber,
              status: existingIssuedInvoice.status,
              total: Number(existingIssuedInvoice.total)
            }
          },
          { status: 409 }
        )
      }
    }

    let number: number | null = null
    let fullNumber: string

    // SERVICE_NOTE: Generate reference (doesn't consume fiscal numbers)
    if (ownerDocType === 'SERVICE_NOTE') {
      // Generate a service note reference: NS-YYYYMMDD-XXX
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
      fullNumber = `NS-${dateStr}-${randomSuffix}`
      // number stays null for service notes
    } else if (customNumber && customNumber > 0) {
      // Use custom number - validate it first
      fullNumber = formatInvoiceNumber(
        invoice.series.prefix,
        invoice.series.year,
        customNumber
      )

      // Check if this number already exists (excluding current invoice)
      const existing = await prisma.clientInvoice.findFirst({
        where: {
          seriesId: invoice.seriesId,
          fullNumber,
          id: { not: id }
        }
      })

      if (existing) {
        return NextResponse.json(
          { error: `Ya existe una factura con el número ${fullNumber}` },
          { status: 400 }
        )
      }

      number = customNumber

      // Update series currentNumber if the custom number is higher
      if (customNumber > invoice.series.currentNumber) {
        await prisma.invoiceSeries.update({
          where: { id: invoice.seriesId },
          data: { currentNumber: customNumber }
        })
      }
    } else if (invoice.number && invoice.fullNumber) {
      // Invoice already has a number assigned (from draft creation) - keep it
      number = invoice.number
      fullNumber = invoice.fullNumber
    } else {
      // Get next number atomically (automatic)
      const result = await getNextInvoiceNumber(invoice.seriesId)
      number = result.number
      fullNumber = result.fullNumber
    }

    // Update invoice to ISSUED
    const updatedInvoice = await prisma.clientInvoice.update({
      where: { id },
      data: {
        number,
        fullNumber,
        status: 'ISSUED',
        isLocked: true,
        issuedAt: new Date()
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

    return NextResponse.json({
      success: true,
      invoice: {
        id: updatedInvoice.id,
        number: updatedInvoice.number,
        fullNumber: updatedInvoice.fullNumber,
        issueDate: updatedInvoice.issueDate.toISOString(),
        issuedAt: updatedInvoice.issuedAt?.toISOString(),
        dueDate: updatedInvoice.dueDate?.toISOString(),
        subtotal: Number(updatedInvoice.subtotal),
        totalVat: Number(updatedInvoice.totalVat),
        total: Number(updatedInvoice.total),
        status: updatedInvoice.status,
        isLocked: updatedInvoice.isLocked,
        owner: updatedInvoice.owner,
        series: updatedInvoice.series,
        items: updatedInvoice.items.map(i => ({
          id: i.id,
          concept: i.concept,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          vatRate: Number(i.vatRate),
          total: Number(i.total)
        }))
      }
    })
  } catch (error) {
    console.error('Error issuing invoice:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
