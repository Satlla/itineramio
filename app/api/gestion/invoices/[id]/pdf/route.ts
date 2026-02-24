import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateClientInvoiceHTML, ClientInvoiceData } from '@/lib/invoice-generator-client'
import { gestionPdfRateLimiter, getRateLimitKey } from '@/lib/rate-limit'

/**
 * GET /api/gestion/invoices/[id]/pdf
 * Genera PDF de factura estilo Holded
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

    // Rate limiting: max 20 PDFs per hour
    const rateLimitKey = getRateLimitKey(request, userId, 'gestion-pdf-invoice')
    const rateLimitResult = gestionPdfRateLimiter(rateLimitKey)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes de PDF. Espera antes de intentar de nuevo.' },
        { status: 429 }
      )
    }

    const { id } = await params

    // Obtener factura con relaciones
    const invoice = await prisma.clientInvoice.findFirst({
      where: {
        id,
        userId,
      },
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
            total: true,
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    // Obtener config del gestor
    const config = await prisma.userInvoiceConfig.findUnique({
      where: { userId },
    })

    if (!config) {
      return NextResponse.json(
        { error: 'Configure los datos de facturación primero' },
        { status: 400 }
      )
    }

    // Nombre y NIF del propietario según tipo
    const ownerName = invoice.owner.type === 'EMPRESA'
      ? invoice.owner.companyName || 'Empresa'
      : `${invoice.owner.firstName || ''} ${invoice.owner.lastName || ''}`.trim() || 'Cliente'

    const ownerNif = invoice.owner.type === 'EMPRESA'
      ? invoice.owner.cif || ''
      : invoice.owner.nif || ''

    // Tipo de factura
    const invoiceType = invoice.isRectifying ? 'RECTIFYING' : 'STANDARD'

    // Construir items en el nuevo formato
    const items = invoice.items.map((item) => {
      const quantity = Number(item.quantity)
      const unitPrice = Math.round(Number(item.unitPrice) * 100) / 100
      const vatRate = Number(item.vatRate)
      const subtotal = Math.round(quantity * unitPrice * 100) / 100
      const vatAmount = Math.round(subtotal * (vatRate / 100) * 100) / 100
      const total = Math.round((subtotal + vatAmount) * 100) / 100

      return {
        concept: item.concept,
        description: item.description || undefined,
        quantity,
        unitPrice,
        vatRate,
        retentionRate: Number(item.retentionRate) || 0,
        subtotal,
        total,
      }
    })

    // Construir datos para el HTML
    const invoiceData: ClientInvoiceData = {
      fullNumber: invoice.fullNumber || undefined,
      status: invoice.status,
      type: invoiceType as 'STANDARD' | 'RECTIFYING',
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate || undefined,

      // Info rectificativa
      rectifyingType: invoice.rectifyingType as 'SUBSTITUTION' | 'DIFFERENCE' | undefined,
      rectifyingReason: invoice.rectifyingReason || undefined,
      originalInvoice: invoice.rectifies
        ? {
            fullNumber: invoice.rectifies.fullNumber || 'N/A',
            issueDate: invoice.rectifies.issueDate,
            total: Number(invoice.rectifies.total) || undefined,
          }
        : undefined,

      // Emisor (gestor)
      issuer: {
        businessName: config.businessName,
        nif: config.nif,
        address: config.address,
        city: config.city,
        postalCode: config.postalCode,
        country: config.country,
        email: config.email || undefined,
        phone: config.phone || undefined,
        logoUrl: config.logoUrl || undefined,
      },

      // Receptor (propietario)
      recipient: {
        name: ownerName,
        nif: ownerNif,
        address: invoice.owner.address || undefined,
        city: invoice.owner.city || undefined,
        postalCode: invoice.owner.postalCode || undefined,
        country: invoice.owner.country || undefined,
      },

      // Items
      items,

      // Totales
      subtotal: Number(invoice.subtotal),
      vatAmount: Number(invoice.totalVat),
      retentionAmount: Number(invoice.retentionAmount) || 0,
      total: Number(invoice.total),

      // Pago - IBAN del gestor
      iban: config.iban || undefined,

      // VeriFactu data (if enabled and hash exists)
      verifactu: config.verifactuEnabled && (invoice as any).verifactuHash
        ? {
            enabled: true,
            qrDataUrl: (invoice as any).qrCode || undefined,
            hash: (invoice as any).verifactuHash || undefined,
          }
        : undefined,
    }

    // Generar HTML
    const html = generateClientInvoiceHTML(invoiceData)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="factura-${invoice.fullNumber || invoice.id}.html"`,
      },
    })
  } catch (error) {
    console.error('Error generating invoice PDF:', error)
    return NextResponse.json(
      { error: 'Error al generar el PDF' },
      { status: 500 }
    )
  }
}
