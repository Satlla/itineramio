import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../../../src/lib/admin-auth'

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

    const { reason } = await request.json()

    // Get the invoice
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
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status !== 'PENDING') {
      return NextResponse.json({ error: 'Only pending invoices can be rejected' }, { status: 400 })
    }

    // Update invoice status
    const updatedInvoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        notes: invoice.notes ? 
          `${invoice.notes}\n\nRejection reason: ${reason}` : 
          `Rejection reason: ${reason}`
      }
    })

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: invoice.userId,
        type: 'PAYMENT_REJECTED',
        title: '❌ Pago rechazado',
        message: `Tu solicitud de pago por €${invoice.finalAmount} ha sido rechazada. Motivo: ${reason}. Por favor, contacta con soporte.`,
        data: {
          invoiceId: invoice.id,
          rejectionReason: reason,
          amount: invoice.finalAmount
        }
      }
    })

    // Log admin activity
    await prisma.adminActivityLog.create({
      data: {
        adminUserId: authResult.adminId,
        action: 'PAYMENT_REJECTED',
        targetType: 'invoice',
        targetId: invoice.id,
        description: `Pago rechazado para ${invoice.user.name} - €${invoice.finalAmount}`,
        metadata: {
          userId: invoice.userId,
          amount: invoice.finalAmount,
          rejectionReason: reason
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Pago rechazado exitosamente',
      invoice: updatedInvoice
    })
    
  } catch (error) {
    console.error('Error rejecting payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}