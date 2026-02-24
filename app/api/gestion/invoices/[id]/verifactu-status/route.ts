import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { verifactiGetStatus, mapVerifactiStatus } from '@/lib/verifactu'

/**
 * GET /api/gestion/invoices/[id]/verifactu-status
 * Check the VeriFactu submission status with Verifacti
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

    // Get invoice and verify ownership
    const invoice = await prisma.clientInvoice.findFirst({
      where: { id, userId },
      select: {
        id: true,
        verifactuStatus: true,
        verifactuHash: true,
        verifactuTimestamp: true,
        invoiceType: true,
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    if (!invoice.verifactuHash) {
      return NextResponse.json(
        { error: 'Esta factura no tiene datos VeriFactu' },
        { status: 400 }
      )
    }

    // Get the latest submission
    const submission = await prisma.verifactuSubmission.findFirst({
      where: { invoiceId: id },
      orderBy: { submittedAt: 'desc' },
    })

    if (!submission) {
      return NextResponse.json({
        verifactuStatus: invoice.verifactuStatus || 'PENDING',
        message: 'No se ha enviado a Verifacti aún',
        canRetry: true,
      })
    }

    // If already in terminal state, return cached
    if (invoice.verifactuStatus === 'ACCEPTED' || invoice.verifactuStatus === 'REJECTED') {
      return NextResponse.json({
        verifactuStatus: invoice.verifactuStatus,
        submittedAt: submission.submittedAt,
        respondedAt: submission.respondedAt,
        errorCode: submission.errorCode,
        errorMessage: submission.errorMessage,
      })
    }

    // Get API key to poll Verifacti
    const config = await prisma.userInvoiceConfig.findUnique({
      where: { userId },
      select: { verifactuApiKey: true },
    })

    if (!config?.verifactuApiKey) {
      return NextResponse.json({
        verifactuStatus: invoice.verifactuStatus || 'PENDING',
        message: 'API key de Verifacti no configurada',
      })
    }

    // Parse the submission response to get UUID
    let uuid: string | null = null
    if (submission.response) {
      try {
        const response = JSON.parse(submission.response)
        uuid = response.uuid
      } catch {
        // Response wasn't JSON
      }
    }

    if (!uuid) {
      return NextResponse.json({
        verifactuStatus: invoice.verifactuStatus || 'PENDING',
        message: 'No se encontró UUID de Verifacti',
        canRetry: true,
      })
    }

    // Poll Verifacti for current status
    const result = await verifactiGetStatus(config.verifactuApiKey, uuid)

    if (!result.success) {
      return NextResponse.json({
        verifactuStatus: invoice.verifactuStatus || 'PENDING',
        error: result.error,
      })
    }

    const newStatus = mapVerifactiStatus(result.data.status)

    // Update invoice and submission if status changed
    if (newStatus !== invoice.verifactuStatus) {
      await prisma.clientInvoice.update({
        where: { id },
        data: { verifactuStatus: newStatus },
      })

      await prisma.verifactuSubmission.update({
        where: { id: submission.id },
        data: {
          status: newStatus,
          respondedAt: new Date(),
          errorCode: result.data.error_code || null,
          errorMessage: result.data.error_message || null,
          response: JSON.stringify(result.data),
        },
      })
    }

    return NextResponse.json({
      verifactuStatus: newStatus,
      verifactiRawStatus: result.data.status,
      submittedAt: submission.submittedAt,
      respondedAt: new Date(),
      errorCode: result.data.error_code,
      errorMessage: result.data.error_message,
    })
  } catch (error) {
    console.error('Error checking VeriFactu status:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
