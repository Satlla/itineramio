import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import {
  computeRegistroAnulacionHash,
  formatDateVF,
  formatAmountVF,
  generateTimestamp,
  verifactiCancelInvoice,
} from '@/lib/verifactu'

/**
 * POST /api/gestion/invoices/[id]/verifactu-cancel
 * Cancel (annul) an invoice's VeriFactu registration with AEAT.
 *
 * This sends a RegistroAnulacion to AEAT via Verifacti.
 * The invoice remains in its current status — this only cancels the fiscal registration.
 * A rectifying invoice should be created separately if needed.
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

    // Get invoice
    const invoice = await prisma.clientInvoice.findFirst({
      where: { id, userId },
      select: {
        id: true,
        fullNumber: true,
        issueDate: true,
        status: true,
        seriesId: true,
        total: true,
        totalVat: true,
        verifactuHash: true,
        verifactuStatus: true,
        series: { select: { prefix: true } },
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    // Must have a VeriFactu hash (was issued with VeriFactu)
    if (!invoice.verifactuHash) {
      return NextResponse.json(
        { error: 'Esta factura no tiene registro VeriFactu' },
        { status: 400 }
      )
    }

    // Must be in a valid state for cancellation
    if (invoice.status === 'DRAFT' || invoice.status === 'PROFORMA') {
      return NextResponse.json(
        { error: 'Solo se pueden anular facturas emitidas' },
        { status: 400 }
      )
    }

    // Get user config
    const config = await prisma.userInvoiceConfig.findUnique({
      where: { userId },
      select: {
        verifactuEnabled: true,
        verifactuApiKey: true,
        nif: true,
        businessName: true,
      },
    })

    if (!config?.verifactuApiKey) {
      return NextResponse.json(
        { error: 'API key de Verifacti no configurada' },
        { status: 400 }
      )
    }

    // Get the last VeriFactu record in this series for hash chaining
    // IMPORTANT: exclude the invoice being cancelled to avoid self-referencing
    const previousRecord = await prisma.clientInvoice.findFirst({
      where: {
        userId,
        seriesId: invoice.seriesId,
        verifactuHash: { not: null },
        issuedAt: { not: null },
        id: { not: id },
      },
      orderBy: { issuedAt: 'desc' },
      select: {
        verifactuHash: true,
        fullNumber: true,
        issueDate: true,
      },
    })

    const previousHash = previousRecord?.verifactuHash || ''
    const timestamp = generateTimestamp()
    const fechaExpedicion = formatDateVF(invoice.issueDate)

    // Compute RegistroAnulacion hash
    const hash = computeRegistroAnulacionHash({
      nifEmisor: config.nif,
      numSerieFactura: invoice.fullNumber || '',
      fechaExpedicion,
      huellaAnterior: previousHash,
      fechaHoraHusoGenRegistro: timestamp,
    })

    // Extract serie and numero
    const prefix = invoice.series.prefix
    const numero = (invoice.fullNumber || '').replace(prefix, '')

    // Submit cancellation to Verifacti
    const result = await verifactiCancelInvoice(
      config.verifactuApiKey,
      {
        serie: prefix,
        numero,
        fecha_expedicion: fechaExpedicion,
      }
    )

    // Record the cancellation submission
    await prisma.verifactuSubmission.create({
      data: {
        invoiceId: id,
        xmlPayload: JSON.stringify({
          type: 'ANULACION',
          serie: prefix,
          numero,
          fecha_expedicion: fechaExpedicion,
          hash,
          previousHash,
        }),
        response: result.success ? JSON.stringify(result.data) : JSON.stringify({ error: result.error }),
        status: result.success ? 'SUBMITTED' : 'ERROR',
        errorMessage: result.success ? null : result.error,
      },
    })

    // Create audit log
    await prisma.invoiceAuditLog.create({
      data: {
        invoiceId: id,
        action: 'VERIFACTU_CANCELLATION',
        newData: {
          fullNumber: invoice.fullNumber,
          cancelHash: hash,
          previousHash,
          verifactiSuccess: result.success,
          verifactiResult: result.success ? result.data : { error: result.error },
        },
        userId,
      },
    }).catch(err => console.error('Error creating audit log:', err))

    if (!result.success) {
      return NextResponse.json(
        { error: `Error al anular en AEAT: ${result.error}` },
        { status: 502 }
      )
    }

    // Mark invoice as CANCELLED
    await prisma.clientInvoice.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json({
      success: true,
      message: 'Anulación enviada a AEAT correctamente',
      uuid: result.data.uuid,
      cancelHash: hash,
    })
  } catch (error) {
    console.error('Error cancelling VeriFactu invoice:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
