import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifactiGetStatus, mapVerifactiStatus } from '@/lib/verifactu'
import { sendEmail } from '@/lib/email-improved'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://itineramio.com'

function buildRejectionEmail(opts: {
  invoiceNumber: string
  newStatus: 'REJECTED' | 'ERROR'
  errorCode?: string | null
  errorMessage?: string | null
  invoiceUrl: string
}): { subject: string; html: string } {
  const isRejected = opts.newStatus === 'REJECTED'
  const subject = isRejected
    ? `❌ AEAT ha rechazado tu factura ${opts.invoiceNumber}`
    : `⚠️ Error registrando tu factura ${opts.invoiceNumber} en AEAT`

  const html = `<!doctype html>
<html lang="es">
<body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;background:#f5f5f5;padding:20px;color:#222;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
    <div style="background:${isRejected ? '#dc2626' : '#d97706'};padding:24px;color:#fff;">
      <h1 style="margin:0;font-size:18px;">${isRejected ? 'Factura rechazada por AEAT' : 'Error al registrar en AEAT'}</h1>
      <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">Factura ${opts.invoiceNumber}</p>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;font-size:14px;line-height:1.5;">
        ${isRejected
          ? 'La AEAT ha rechazado el registro VeriFactu de esta factura. Es necesario corregirla y reenviarla.'
          : 'Se produjo un error al intentar registrar la factura en AEAT. Puedes reintentar el envío.'}
      </p>
      ${opts.errorMessage ? `
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px;margin:16px 0;">
        <p style="margin:0 0 4px;font-size:12px;color:#7f1d1d;font-weight:600;">Motivo${opts.errorCode ? ` (código ${opts.errorCode})` : ''}:</p>
        <p style="margin:0;font-size:13px;color:#7f1d1d;">${opts.errorMessage}</p>
      </div>` : ''}
      <a href="${opts.invoiceUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:500;margin-top:8px;">Ver factura</a>
      <p style="margin:24px 0 0;font-size:12px;color:#666;line-height:1.5;">
        Recordatorio: las facturas con VeriFactu activo deben quedar registradas en AEAT.
        Si el problema persiste, contacta con tu gestor o con soporte.
      </p>
    </div>
  </div>
</body>
</html>`

  return { subject, html }
}

/**
 * Cron job para actualizar estados de facturas VeriFactu pendientes.
 * Recorre facturas con verifactuStatus PENDING o SUBMITTED y consulta Verifacti.
 *
 * Schedule: cada hora (0 * * * *)
 */

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  if (!CRON_SECRET) {
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

      // Update invoice and submission atomically
      await prisma.$transaction(async (tx) => {
        await tx.clientInvoice.update({
          where: { id: invoice.id },
          data: { verifactuStatus: newStatus },
        })
        await tx.verifactuSubmission.update({
          where: { id: submission.id },
          data: {
            status: newStatus,
            respondedAt: new Date(),
            errorCode: result.data.error_code || null,
            errorMessage: result.data.error_message || null,
            response: JSON.stringify(result.data),
          },
        })
      }, { timeout: 10000 })

      updated++

      // Notificar al usuario si AEAT rechazó o hubo error
      if (newStatus === 'REJECTED' || newStatus === 'ERROR') {
        try {
          const user = await prisma.user.findUnique({
            where: { id: invoice.userId },
            select: { email: true, name: true },
          })
          if (user?.email) {
            const { subject, html } = buildRejectionEmail({
              invoiceNumber: invoice.fullNumber || invoice.id,
              newStatus,
              errorCode: result.data.error_code,
              errorMessage: result.data.error_message,
              invoiceUrl: `${APP_URL}/gestion/facturas/${invoice.id}`,
            })
            await sendEmail({ to: user.email, subject, html })
          }
        } catch {
          // Falla silenciosa: el cron no debe romperse por un email
        }
      }
    }

    return NextResponse.json({
      message: 'VeriFactu status check complete',
      processed: pendingInvoices.length,
      updated,
      errors,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
