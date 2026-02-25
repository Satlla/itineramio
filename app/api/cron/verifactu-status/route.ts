import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifactiGetStatus, mapVerifactiStatus } from '@/lib/verifactu'

/**
 * Cron job para actualizar estados de facturas VeriFactu pendientes.
 * Recorre facturas con verifactuStatus PENDING o SUBMITTED y consulta Verifacti.
 *
 * Schedule: cada hora (0 * * * *)
 */

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  if (!CRON_SECRET) {
    console.error('CRON_SECRET not configured')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find all invoices with pending/submitted VeriFactu status
    const pendingInvoices = await prisma.clientInvoice.findMany({
      where: {
        verifactuStatus: { in: ['PENDING', 'SUBMITTED'] },
        verifactuHash: { not: null },
      },
      select: {
        id: true,
        userId: true,
        verifactuStatus: true,
        fullNumber: true,
      },
      take: 50, // Process max 50 per run to stay within limits
    })

    if (pendingInvoices.length === 0) {
      return NextResponse.json({ message: 'No pending invoices', processed: 0 })
    }

    // Group by userId to batch API key lookups
    const userIds = [...new Set(pendingInvoices.map(i => i.userId))]
    const configs = await prisma.userInvoiceConfig.findMany({
      where: { userId: { in: userIds }, verifactuApiKey: { not: null } },
      select: { userId: true, verifactuApiKey: true },
    })
    const configMap = new Map(configs.map(c => [c.userId, c.verifactuApiKey!]))

    let updated = 0
    let errors = 0

    for (const invoice of pendingInvoices) {
      const apiKey = configMap.get(invoice.userId)
      if (!apiKey) continue

      // Get the latest submission with a UUID
      const submission = await prisma.verifactuSubmission.findFirst({
        where: { invoiceId: invoice.id, status: { in: ['SUBMITTED', 'PENDING'] } },
        orderBy: { submittedAt: 'desc' },
      })

      if (!submission?.response) continue

      let uuid: string | null = null
      try {
        const response = JSON.parse(submission.response)
        uuid = response.uuid
      } catch {
        continue
      }

      if (!uuid) continue

      // Poll Verifacti
      const result = await verifactiGetStatus(apiKey, uuid)
      if (!result.success) {
        errors++
        continue
      }

      const newStatus = mapVerifactiStatus(result.data.status)
      if (newStatus === invoice.verifactuStatus) continue

      // Update invoice and submission
      await prisma.clientInvoice.update({
        where: { id: invoice.id },
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

      updated++
      console.log(`[verifactu-cron] ${invoice.fullNumber}: ${invoice.verifactuStatus} → ${newStatus}`)
    }

    return NextResponse.json({
      message: 'VeriFactu status check complete',
      processed: pendingInvoices.length,
      updated,
      errors,
    })
  } catch (error) {
    console.error('[verifactu-cron] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
