import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { getNextInvoiceNumber, previewNextNumber, formatInvoiceNumber } from '@/lib/invoice-numbering'
import {
  computeRegistroAltaHash,
  formatDateVF,
  formatAmountVF,
  generateTimestamp,
  generateVerifactuQR,
  resolveAEATInvoiceType,
  verifactiCreateInvoice,
  buildVerifactiRequest,
} from '@/lib/verifactu'

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

    // Get invoice with validation (includes rectificativa relation for VeriFactu)
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
            companyName: true,
            nif: true,
            cif: true,
          }
        },
        rectifies: {
          select: {
            id: true,
            fullNumber: true,
            issueDate: true,
            subtotal: true,
            totalVat: true,
            total: true,
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

    // Check if VeriFactu is enabled for this user
    const invoiceConfig = await prisma.userInvoiceConfig.findUnique({
      where: { userId },
      select: { verifactuEnabled: true, siiExempt: true, nif: true, businessName: true, verifactuApiKey: true }
    })

    const verifactuEnabled = invoiceConfig?.verifactuEnabled && !invoiceConfig?.siiExempt

    // VeriFactu: compute hash and QR if enabled
    let verifactuData: {
      verifactuHash?: string
      verifactuPreviousHash?: string
      verifactuTimestamp?: Date
      invoiceType?: 'F1' | 'F2' | 'F3' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5'
      qrCode?: string
      verifactuStatus?: 'PENDING'
    } = {}

    if (verifactuEnabled && invoiceConfig) {
      // Validate NIF before computing hash — empty NIF would produce wrong hash
      if (!invoiceConfig.nif || invoiceConfig.nif.trim().length === 0) {
        return NextResponse.json(
          { error: 'VeriFactu está activado pero no has configurado tu NIF en el perfil de gestor. Configúralo antes de emitir.' },
          { status: 400 }
        )
      }

      // Resolve AEAT invoice type
      const invoiceType = resolveAEATInvoiceType({
        isRectifying: invoice.isRectifying,
        rectifyingType: invoice.rectifyingType,
        total: Number(invoice.total),
      })

      // Get previous record from the last issued invoice in the same series
      // We need the full identification for Encadenamiento per AEAT XSD
      const previousInvoice = await prisma.clientInvoice.findFirst({
        where: {
          userId,
          seriesId: invoice.seriesId,
          status: { in: ['ISSUED', 'SENT', 'PAID'] },
          verifactuHash: { not: null },
          id: { not: id },
        },
        orderBy: { issuedAt: 'desc' },
        select: {
          verifactuHash: true,
          fullNumber: true,
          issueDate: true,
        },
      })
      const previousHash = previousInvoice?.verifactuHash || ''

      const timestamp = generateTimestamp()
      const fechaExpedicion = formatDateVF(invoice.issueDate)

      // Compute hash
      const hash = computeRegistroAltaHash({
        nifEmisor: invoiceConfig.nif,
        numSerieFactura: fullNumber,
        fechaExpedicion,
        tipoFactura: invoiceType,
        cuotaTotal: formatAmountVF(Number(invoice.totalVat)),
        importeTotal: formatAmountVF(Number(invoice.total)),
        huellaAnterior: previousHash,
        fechaHoraHusoGenRegistro: timestamp,
      })

      // Generate QR code
      let qrDataUrl: string | undefined
      try {
        qrDataUrl = await generateVerifactuQR({
          nif: invoiceConfig.nif,
          numSerie: fullNumber,
          fecha: fechaExpedicion,
          importe: formatAmountVF(Number(invoice.total)),
        })
      } catch (qrError) {
        console.error('Error generating VeriFactu QR:', qrError)
      }

      verifactuData = {
        verifactuHash: hash,
        verifactuPreviousHash: previousHash || null as any,
        verifactuTimestamp: new Date(),
        invoiceType,
        qrCode: qrDataUrl,
        verifactuStatus: 'PENDING',
      }

      // Store extra audit data for hash re-verification and XML generation
      const auditExtra: Record<string, unknown> = {
        // Exact timestamp string used in hash computation (DateTime field loses timezone)
        fechaHoraHusoGenRegistro: timestamp,
        fechaExpedicion,
        nifEmisor: invoiceConfig.nif,
        cuotaTotal: formatAmountVF(Number(invoice.totalVat)),
        importeTotal: formatAmountVF(Number(invoice.total)),
      }

      if (previousInvoice?.fullNumber && previousInvoice?.issueDate) {
        const prevFechaExpedicion = formatDateVF(previousInvoice.issueDate)
        auditExtra.registroAnterior = {
          nifEmisor: invoiceConfig.nif,
          numSerieFactura: previousInvoice.fullNumber,
          fechaExpedicion: prevFechaExpedicion,
          huella: previousHash,
        }
      }

      ;(verifactuData as Record<string, unknown>)._auditExtra = auditExtra
    }

    // Update invoice to ISSUED (with VeriFactu data if enabled)
    const updatedInvoice = await prisma.clientInvoice.update({
      where: { id },
      data: {
        number,
        fullNumber,
        status: 'ISSUED',
        isLocked: true,
        issuedAt: new Date(),
        ...verifactuData,
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

    // Create audit log entry
    if (verifactuEnabled) {
      const auditExtra = (verifactuData as Record<string, unknown>)._auditExtra || {}
      await prisma.invoiceAuditLog.create({
        data: {
          invoiceId: id,
          action: 'ISSUED_WITH_VERIFACTU',
          newData: {
            fullNumber,
            verifactuHash: verifactuData.verifactuHash,
            verifactuPreviousHash: verifactuData.verifactuPreviousHash,
            invoiceType: verifactuData.invoiceType,
            ...(auditExtra as Record<string, unknown>),
          },
          userId,
        }
      }).catch(err => console.error('Error creating audit log:', err))
    }

    // Submit to Verifacti if enabled and API key configured
    // This is non-blocking — the invoice is already issued regardless of Verifacti result
    let verifactiResult: { uuid?: string; qrUrl?: string; error?: string } | null = null
    if (verifactuEnabled && invoiceConfig?.verifactuApiKey && invoice.owner) {
      try {
        const verifactiRequest = buildVerifactiRequest({
          fullNumber,
          issueDate: invoice.issueDate,
          isRectifying: invoice.isRectifying,
          rectifyingType: invoice.rectifyingType,
          invoiceType: verifactuData.invoiceType || 'F1',
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

        const result = await verifactiCreateInvoice(invoiceConfig.verifactuApiKey, verifactiRequest)

        if (result.success) {
          verifactiResult = { uuid: result.data.uuid, qrUrl: result.data.qr_url }

          // Update invoice with Verifacti status
          await prisma.clientInvoice.update({
            where: { id },
            data: {
              verifactuStatus: 'SUBMITTED',
            },
          })

          // Save submission record with response containing UUID
          await prisma.verifactuSubmission.create({
            data: {
              invoiceId: id,
              xmlPayload: JSON.stringify(verifactiRequest),
              response: JSON.stringify(result.data),
              status: 'SUBMITTED',
            },
          }).catch(err => console.error('Error saving Verifacti submission:', err))
        } else {
          verifactiResult = { error: result.error }
          console.error('Verifacti submission failed:', result.error)

          // Save failed submission for retry tracking
          await prisma.verifactuSubmission.create({
            data: {
              invoiceId: id,
              xmlPayload: JSON.stringify(verifactiRequest),
              response: null,
              status: 'ERROR',
              errorMessage: result.error,
            },
          }).catch(err => console.error('Error saving failed submission:', err))
        }
      } catch (verifactiError) {
        console.error('Error submitting to Verifacti:', verifactiError)
        verifactiResult = { error: 'Error de conexión con Verifacti' }

        // Save connection error for retry tracking
        await prisma.verifactuSubmission.create({
          data: {
            invoiceId: id,
            xmlPayload: '{}',
            status: 'ERROR',
            errorMessage: verifactiError instanceof Error ? verifactiError.message : 'Error de conexión',
          },
        }).catch(err => console.error('Error saving error submission:', err))
      }
    }

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
        verifactuHash: updatedInvoice.verifactuHash,
        verifactuStatus: updatedInvoice.verifactuStatus,
        invoiceType: updatedInvoice.invoiceType,
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
      },
      ...(verifactiResult ? { verifacti: verifactiResult } : {}),
    })
  } catch (error) {
    console.error('Error issuing invoice:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
