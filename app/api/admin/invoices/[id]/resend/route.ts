import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAdminAuth, createActivityLog, getRequestInfo } from '../../../../../../src/lib/admin-auth'
import { sendEmail, emailTemplates } from '../../../../../../src/lib/email-improved'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    // Get invoice with user details
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
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

    // Send invoice notification email
    const emailResult = await sendEmail({
      to: invoice.user.email,
      subject: `Factura ${invoice.invoiceNumber} - Itineramio`,
      html: emailTemplates.invoiceNotification({
        userName: invoice.user.name || 'Cliente',
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.finalAmount.toFixed(2),
        dueDate: new Date(invoice.dueDate).toLocaleDateString('es-ES'),
        status: invoice.status,
        isPaid: invoice.status === 'PAID' || invoice.status === 'paid',
        paidDate: invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString('es-ES') : undefined,
        paymentMethod: invoice.paymentMethod || undefined,
        downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/invoices/${invoice.id}/download`
      })
    })

    if (!emailResult.success) {
      console.error('Error sending invoice email:', emailResult.error)
      return NextResponse.json(
        { error: 'Error al enviar email: ' + emailResult.error },
        { status: 500 }
      )
    }

    // Log admin activity
    const { ipAddress, userAgent } = getRequestInfo(request)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'invoice_resent',
      targetType: 'invoice',
      targetId: invoice.id,
      description: `Reenviada factura ${invoice.invoiceNumber} a ${invoice.user.email}`,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        userEmail: invoice.user.email
      },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({
      success: true,
      message: `Factura ${invoice.invoiceNumber} reenviada exitosamente a ${invoice.user.email}`
    })

  } catch (error) {
    console.error('Error resending invoice:', error)
    return NextResponse.json(
      { error: 'Error al reenviar factura' },
      { status: 500 }
    )
  }
}