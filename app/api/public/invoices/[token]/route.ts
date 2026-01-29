import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/public/invoices/[token]
 * Get invoice data by public token (no auth required)
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
        owner: {
          select: {
            type: true,
            firstName: true,
            lastName: true,
            companyName: true,
            nif: true,
            cif: true,
            address: true,
            city: true,
            postalCode: true,
            country: true
          }
        },
        items: {
          orderBy: { order: 'asc' }
        },
        series: {
          select: {
            prefix: true
          }
        },
        user: {
          select: {
            id: true
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

    // Owner name
    const ownerName = invoice.owner.type === 'EMPRESA'
      ? invoice.owner.companyName || 'Cliente'
      : `${invoice.owner.firstName || ''} ${invoice.owner.lastName || ''}`.trim() || 'Cliente'

    const ownerNif = invoice.owner.type === 'EMPRESA'
      ? invoice.owner.cif
      : invoice.owner.nif

    return NextResponse.json({
      invoice: {
        id: invoice.id,
        fullNumber: invoice.fullNumber,
        status: invoice.status,
        issueDate: invoice.issueDate.toISOString(),
        dueDate: invoice.dueDate?.toISOString(),
        subtotal: Number(invoice.subtotal),
        totalVat: Number(invoice.totalVat),
        retentionRate: Number(invoice.retentionRate),
        retentionAmount: Number(invoice.retentionAmount),
        total: Number(invoice.total),
        notes: invoice.notes,
        items: invoice.items.map(i => ({
          concept: i.concept,
          description: i.description,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          vatRate: Number(i.vatRate),
          retentionRate: Number(i.retentionRate),
          total: Number(i.total)
        }))
      },
      recipient: {
        name: ownerName,
        nif: ownerNif,
        address: invoice.owner.address,
        city: invoice.owner.city,
        postalCode: invoice.owner.postalCode,
        country: invoice.owner.country
      },
      issuer: config ? {
        businessName: config.businessName,
        nif: config.nif,
        address: config.address,
        city: config.city,
        postalCode: config.postalCode,
        country: config.country,
        email: config.email,
        phone: config.phone,
        logoUrl: config.logoUrl,
        iban: config.iban,
        bankName: config.bankName
      } : null
    })
  } catch (error) {
    console.error('Error fetching public invoice:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
