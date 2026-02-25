import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import {
  verifactiCreateInvoice,
  buildVerifactiRequest,
  resolveAEATInvoiceType,
} from '@/lib/verifactu'

/**
 * POST /api/gestion/invoices/[id]/verifactu-retry
 * Retry a failed VeriFactu submission to Verifacti.
 *
 * Only works for invoices that are ISSUED but have verifactuStatus PENDING or ERROR.
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

    const invoice = await prisma.clientInvoice.findFirst({
      where: { id, userId },
      include: {
        series: true,
        items: { orderBy: { order: 'asc' } },
        owner: {
          select: {
            id: true,
            type: true,
            firstName: true,
            lastName: true,
            companyName: true,
            nif: true,
            cif: true,
          },
        },
        rectifies: {
          select: {
            id: true,
            fullNumber: true,
            issueDate: true,
            subtotal: true,
            totalVat: true,
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
    }

    if (!invoice.verifactuHash) {
      return NextResponse.json({ error: 'Esta factura no tiene datos VeriFactu' }, { status: 400 })
    }

    // Only retry if not already submitted successfully
    if (invoice.verifactuStatus === 'SUBMITTED' || invoice.verifactuStatus === 'ACCEPTED') {
      return NextResponse.json({ error: 'Esta factura ya fue enviada a AEAT correctamente' }, { status: 400 })
    }

    const config = await prisma.userInvoiceConfig.findUnique({
      where: { userId },
      select: { verifactuApiKey: true, nif: true },
    })

    if (!config?.verifactuApiKey) {
      return NextResponse.json({ error: 'API key de Verifacti no configurada' }, { status: 400 })
    }

    if (!invoice.owner) {
      return NextResponse.json({ error: 'La factura no tiene propietario asignado' }, { status: 400 })
    }

    // Build request
    const invoiceType = resolveAEATInvoiceType({
      isRectifying: invoice.isRectifying,
      rectifyingType: invoice.rectifyingType,
      total: Number(invoice.total),
    })

    const verifactiRequest = buildVerifactiRequest({
      fullNumber: invoice.fullNumber || '',
      issueDate: invoice.issueDate,
      isRectifying: invoice.isRectifying,
      rectifyingType: invoice.rectifyingType,
      invoiceType,
      total: Number(invoice.total),
      totalVat: Number(invoice.totalVat),
      items: invoice.items.map(i => ({
        concept: i.concept,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        vatRate: Number(i.vatRate),
      })),
      owner: {
        type: invoice.owner.type,
        firstName: invoice.owner.firstName,
        lastName: invoice.owner.lastName,
        companyName: invoice.owner.companyName,
        nif: invoice.owner.nif,
        cif: invoice.owner.cif,
      },
      series: {
        prefix: invoice.series.prefix,
      },
      rectifies: invoice.rectifies ? {
        fullNumber: invoice.rectifies.fullNumber || '',
        issueDate: invoice.rectifies.issueDate,
        subtotal: Number(invoice.rectifies.subtotal),
        totalVat: Number(invoice.rectifies.totalVat),
      } : null,
    })

    // Submit to Verifacti
    const result = await verifactiCreateInvoice(config.verifactuApiKey, verifactiRequest)

    if (result.success) {
      // Update invoice status
      await prisma.clientInvoice.update({
        where: { id },
        data: { verifactuStatus: 'SUBMITTED' },
      })

      // Save submission record
      await prisma.verifactuSubmission.create({
        data: {
          invoiceId: id,
          xmlPayload: JSON.stringify(verifactiRequest),
          response: JSON.stringify(result.data),
          status: 'SUBMITTED',
        },
      })

      // Audit log
      await prisma.invoiceAuditLog.create({
        data: {
          invoiceId: id,
          action: 'VERIFACTU_RETRY_SUCCESS',
          newData: {
            uuid: result.data.uuid,
            fullNumber: invoice.fullNumber,
          },
          userId,
        },
      }).catch(() => {})

      return NextResponse.json({
        success: true,
        message: 'Reenvío exitoso a AEAT',
        uuid: result.data.uuid,
      })
    } else {
      // Save failed attempt
      await prisma.verifactuSubmission.create({
        data: {
          invoiceId: id,
          xmlPayload: JSON.stringify(verifactiRequest),
          status: 'ERROR',
          errorMessage: result.error,
        },
      })

      return NextResponse.json(
        { error: `Error al reenviar: ${result.error}` },
        { status: 502 }
      )
    }
  } catch (error) {
    console.error('Error retrying VeriFactu submission:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
