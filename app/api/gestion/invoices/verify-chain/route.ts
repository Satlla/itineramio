import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/invoices/verify-chain?seriesId=xxx
 * Verify the VeriFactu hash chain integrity for a given invoice series.
 *
 * Checks that each invoice's verifactuPreviousHash matches the previous invoice's verifactuHash.
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const seriesId = request.nextUrl.searchParams.get('seriesId')
    if (!seriesId) {
      return NextResponse.json({ error: 'seriesId es obligatorio' }, { status: 400 })
    }

    // Verify the series belongs to the user (through invoiceConfig)
    const series = await prisma.invoiceSeries.findFirst({
      where: {
        id: seriesId,
        invoiceConfig: { userId },
      },
      select: { id: true, name: true, prefix: true },
    })

    if (!series) {
      return NextResponse.json({ error: 'Serie no encontrada' }, { status: 404 })
    }

    // Get all issued invoices with VeriFactu hashes in this series, ordered by issue date
    const invoices = await prisma.clientInvoice.findMany({
      where: {
        userId,
        seriesId,
        verifactuHash: { not: null },
        status: { in: ['ISSUED', 'SENT', 'PAID', 'CANCELLED'] },
      },
      orderBy: { issuedAt: 'asc' },
      select: {
        id: true,
        fullNumber: true,
        issuedAt: true,
        verifactuHash: true,
        verifactuPreviousHash: true,
        verifactuStatus: true,
        status: true,
      },
    })

    if (invoices.length === 0) {
      return NextResponse.json({
        valid: true,
        message: 'No hay facturas con VeriFactu en esta serie',
        chainLength: 0,
      })
    }

    // Verify the chain
    const issues: Array<{
      index: number
      invoiceId: string
      fullNumber: string | null
      expected: string
      actual: string
      type: 'BROKEN_CHAIN' | 'FIRST_NOT_EMPTY'
    }> = []

    // First invoice should have empty previousHash
    if (invoices[0].verifactuPreviousHash && invoices[0].verifactuPreviousHash !== '') {
      issues.push({
        index: 0,
        invoiceId: invoices[0].id,
        fullNumber: invoices[0].fullNumber,
        expected: '(vacío — primer registro)',
        actual: invoices[0].verifactuPreviousHash,
        type: 'FIRST_NOT_EMPTY',
      })
    }

    // Check chain continuity
    for (let i = 1; i < invoices.length; i++) {
      const prevHash = invoices[i - 1].verifactuHash
      const currentPrevHash = invoices[i].verifactuPreviousHash

      if (currentPrevHash !== prevHash) {
        issues.push({
          index: i,
          invoiceId: invoices[i].id,
          fullNumber: invoices[i].fullNumber,
          expected: prevHash || '(vacío)',
          actual: currentPrevHash || '(vacío)',
          type: 'BROKEN_CHAIN',
        })
      }
    }

    return NextResponse.json({
      valid: issues.length === 0,
      series: {
        id: series.id,
        name: series.name,
        prefix: series.prefix,
      },
      chainLength: invoices.length,
      firstInvoice: invoices[0].fullNumber,
      lastInvoice: invoices[invoices.length - 1].fullNumber,
      lastHash: invoices[invoices.length - 1].verifactuHash?.substring(0, 16) + '...',
      issues: issues.length > 0 ? issues : undefined,
    })
  } catch (error) {
    console.error('Error verifying hash chain:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
