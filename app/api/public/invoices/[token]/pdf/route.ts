import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateClientInvoiceHTML, ClientInvoiceData } from '@/lib/invoice-generator-client'

/**
 * GET /api/public/invoices/[token]/pdf
 * Get invoice PDF by public token (no auth required)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token || token.length < 32) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 400 }
      )
    }

    // Find invoice by public token
    const invoice = await prisma.clientInvoice.findUnique({
      where: { publicToken: token },
      include: {
        owner: true,
        items: {
          orderBy: { order: 'asc' }
        },
        series: true,
        rectifies: {
          select: {
            id: true,
            fullNumber: true,
            issueDate: true,
            total: true
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

    // Get manager config for issuer info
    const config = await prisma.userInvoiceConfig.findUnique({
      where: { userId: invoice.userId }
    })

    if (!config) {
      return NextResponse.json(
        { error: 'Configuración no encontrada' },
        { status: 400 }
      )
    }

    // Owner name
    const ownerName = invoice.owner.type === 'EMPRESA'
      ? invoice.owner.companyName || 'Empresa'
      : `${invoice.owner.firstName || ''} ${invoice.owner.lastName || ''}`.trim() || 'Cliente'

    const ownerNif = invoice.owner.type === 'EMPRESA'
      ? invoice.owner.cif || ''
      : invoice.owner.nif || ''

    // Invoice type
    const invoiceType = invoice.isRectifying ? 'RECTIFYING' : 'STANDARD'

    // Build items
    const items = invoice.items.map((item) => {
      const quantity = Number(item.quantity)
      const unitPrice = Number(item.unitPrice)
      const vatRate = Number(item.vatRate)
      const subtotal = quantity * unitPrice
      const vatAmount = subtotal * (vatRate / 100)
      const total = subtotal + vatAmount

      return {
        concept: item.concept,
        description: item.description || undefined,
        quantity,
        unitPrice,
        vatRate,
        retentionRate: Number(item.retentionRate) || 0,
        subtotal,
        total
      }
    })

    // Build invoice data
    const invoiceData: ClientInvoiceData = {
      fullNumber: invoice.fullNumber || undefined,
      status: invoice.status,
      type: invoiceType as 'STANDARD' | 'RECTIFYING',
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate || undefined,
      rectifyingType: invoice.rectifyingType as 'SUBSTITUTION' | 'DIFFERENCE' | undefined,
      rectifyingReason: invoice.rectifyingReason || undefined,
      originalInvoice: invoice.rectifies
        ? {
            fullNumber: invoice.rectifies.fullNumber || 'N/A',
            issueDate: invoice.rectifies.issueDate,
            total: Number(invoice.rectifies.total) || undefined
          }
        : undefined,
      issuer: {
        businessName: config.businessName,
        nif: config.nif,
        address: config.address,
        city: config.city,
        postalCode: config.postalCode,
        country: config.country,
        email: config.email || undefined,
        phone: config.phone || undefined,
        logoUrl: config.logoUrl || undefined
      },
      recipient: {
        name: ownerName,
        nif: ownerNif,
        address: invoice.owner.address || undefined,
        city: invoice.owner.city || undefined,
        postalCode: invoice.owner.postalCode || undefined,
        country: invoice.owner.country || undefined
      },
      items,
      subtotal: Number(invoice.subtotal),
      vatAmount: Number(invoice.totalVat),
      retentionAmount: Number(invoice.retentionAmount) || 0,
      total: Number(invoice.total),
      iban: config.iban || undefined
    }

    // Generate HTML
    const html = generateClientInvoiceHTML(invoiceData)

    const filename = invoice.status === 'DRAFT'
      ? `borrador-factura.html`
      : `factura-${invoice.fullNumber || invoice.id}.html`

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Error generating public invoice PDF:', error)
    return NextResponse.json(
      { error: 'Error al generar el PDF' },
      { status: 500 }
    )
  }
}
