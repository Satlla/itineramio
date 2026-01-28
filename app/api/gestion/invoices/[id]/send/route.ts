import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * GET /api/gestion/invoices/[id]/send
 * Get send preview data (suggested email, subject, body)
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
      where: { id, userId },
      include: {
        owner: true,
        series: true
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    // Get manager config for sender name
    const config = await prisma.userInvoiceConfig.findUnique({
      where: { userId }
    })

    const ownerName = invoice.owner.type === 'EMPRESA'
      ? invoice.owner.companyName || 'Cliente'
      : `${invoice.owner.firstName || ''} ${invoice.owner.lastName || ''}`.trim() || 'Cliente'

    const businessName = config?.businessName || 'Mi Empresa'
    const invoiceNumber = invoice.fullNumber || 'Borrador'

    // Suggested content
    const suggestedSubject = `Factura ${invoiceNumber} - ${businessName}`
    const suggestedBody = `Hola ${ownerName},

Aquí tienes la factura ${invoiceNumber} correspondiente a nuestros servicios de gestión.

Puedes ver y descargar la factura haciendo clic en el botón de abajo.

Gracias por confiar en nosotros.

Un saludo,
${businessName}`

    return NextResponse.json({
      canSend: invoice.status !== 'DRAFT',
      email: invoice.owner.email || '',
      ownerName,
      invoiceNumber,
      suggestedSubject,
      suggestedBody,
      lastSentAt: invoice.sentAt?.toISOString(),
      lastSentTo: invoice.sentTo
    })
  } catch (error) {
    console.error('Error getting send preview:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/gestion/invoices/[id]/send
 * Send invoice by email with custom message
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

    // Get custom content from body
    const body = await request.json()
    const { email, subject, message } = body

    if (!email) {
      return NextResponse.json(
        { error: 'El email es requerido' },
        { status: 400 }
      )
    }

    // Get invoice with all relations
    const invoice = await prisma.clientInvoice.findFirst({
      where: { id, userId },
      include: {
        owner: true,
        items: { orderBy: { order: 'asc' } },
        series: true
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    // Check if invoice can be sent (only ISSUED or later)
    if (invoice.status === 'DRAFT') {
      return NextResponse.json(
        { error: 'No se pueden enviar facturas en estado borrador. Emite la factura primero.' },
        { status: 400 }
      )
    }

    // Get manager config
    const config = await prisma.userInvoiceConfig.findUnique({
      where: { userId }
    })

    if (!config) {
      return NextResponse.json(
        { error: 'Configure los datos de facturación primero' },
        { status: 400 }
      )
    }

    // Generate or get public token
    let publicToken = invoice.publicToken
    if (!publicToken) {
      publicToken = crypto.randomBytes(32).toString('hex')
    }

    const ownerName = invoice.owner.type === 'EMPRESA'
      ? invoice.owner.companyName || 'Cliente'
      : `${invoice.owner.firstName || ''} ${invoice.owner.lastName || ''}`.trim() || 'Cliente'

    const businessName = config.businessName || 'Mi Empresa'
    const invoiceNumber = invoice.fullNumber || 'Factura'
    const formattedTotal = Number(invoice.total).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    // Build public URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'
    const publicUrl = `${baseUrl}/factura/${publicToken}`

    // Email subject
    const emailSubject = subject || `Factura ${invoiceNumber} - ${businessName}`

    // Convert message line breaks to HTML
    const messageHtml = (message || '').replace(/\n/g, '<br>')

    // Build email HTML
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${emailSubject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 30px; text-align: center;">
            ${config.logoUrl
              ? `<img src="${config.logoUrl}" alt="${businessName}" style="height: 50px; margin-bottom: 15px; filter: brightness(0) invert(1);">`
              : `<h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">${businessName}</h1>`
            }
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <div style="color: #374151; font-size: 16px; margin-bottom: 30px;">
              ${messageHtml}
            </div>

            <!-- Invoice Summary Card -->
            <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin: 30px 0; border: 1px solid #e2e8f0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <span style="color: #6b7280; font-size: 14px;">Factura</span>
                <span style="color: #1f2937; font-weight: 600; font-size: 16px;">${invoiceNumber}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                <span style="color: #6b7280; font-size: 14px;">Total</span>
                <span style="color: #7c3aed; font-weight: 700; font-size: 24px;">${formattedTotal}€</span>
              </div>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${publicUrl}"
                 style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
                Ver y descargar factura
              </a>
            </div>

            <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-top: 30px;">
              O copia este enlace: <a href="${publicUrl}" style="color: #7c3aed;">${publicUrl}</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              ${config.email || ''} ${config.phone ? `· ${config.phone}` : ''}
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              Enviado desde <a href="https://www.itineramio.com" style="color: #7c3aed; text-decoration: none;">Itineramio</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send email via Resend
    const { error: sendError } = await resend.emails.send({
      from: `${businessName} <facturas@itineramio.com>`,
      replyTo: config.email || undefined,
      to: email,
      subject: emailSubject,
      html: emailHTML
    })

    if (sendError) {
      console.error('Resend error:', sendError)
      return NextResponse.json(
        { error: 'Error al enviar el email' },
        { status: 500 }
      )
    }

    // Update invoice with send info and public token
    await prisma.clientInvoice.update({
      where: { id },
      data: {
        publicToken,
        sentAt: new Date(),
        sentTo: email,
        emailSubject,
        emailBody: message,
        status: invoice.status === 'ISSUED' ? 'SENT' : invoice.status
      }
    })

    return NextResponse.json({
      success: true,
      message: `Factura enviada a ${email}`,
      publicUrl
    })
  } catch (error) {
    console.error('Error sending invoice:', error)
    return NextResponse.json(
      { error: 'Error al enviar la factura' },
      { status: 500 }
    )
  }
}
