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

    const { paymentReference, confirmedAt } = await request.json()

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

    if (invoice.status === 'PAID') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 })
    }

    // Update invoice status
    const updatedInvoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        status: 'PAID',
        paidDate: new Date(confirmedAt),
        paymentReference: paymentReference
      }
    })

    // Activate properties associated with this payment
    let properties = []
    try {
      if (invoice.notes) {
        const notesData = JSON.parse(invoice.notes)
        properties = notesData.properties || []
      }
    } catch (e) {
      console.error('Error parsing invoice notes:', e)
    }

    // Calculate subscription end date based on duration
    let months = 1
    try {
      if (invoice.notes) {
        const notesData = JSON.parse(invoice.notes)
        months = notesData.months || 1
      }
    } catch (e) {
      months = 1
    }

    const subscriptionEnd = new Date()
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + months)

    // Activate each property
    const activatedProperties = []
    for (const prop of properties) {
      try {
        const updatedProperty = await prisma.property.update({
          where: { 
            id: prop.id,
            hostId: invoice.userId // Security check
          },
          data: {
            status: 'ACTIVE',
            subscriptionEndsAt: subscriptionEnd,
            lastPaymentDate: new Date(confirmedAt),
            isPublished: true,
            publishedAt: new Date()
          }
        })
        activatedProperties.push(updatedProperty)
      } catch (error) {
        console.error(`Error activating property ${prop.id}:`, error)
      }
    }

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: invoice.userId,
        type: 'PAYMENT_CONFIRMED',
        title: '✅ Pago confirmado',
        message: `Tu pago de €${invoice.finalAmount} ha sido confirmado. ${activatedProperties.length} propiedad(es) activada(s) hasta ${subscriptionEnd.toLocaleDateString()}.`,
        data: {
          invoiceId: invoice.id,
          activatedProperties: activatedProperties.length,
          subscriptionEnd: subscriptionEnd.toISOString()
        }
      }
    })

    // Log admin activity
    await prisma.adminActivityLog.create({
      data: {
        adminUserId: authResult.adminId,
        action: 'PAYMENT_CONFIRMED',
        targetType: 'invoice',
        targetId: invoice.id,
        description: `Pago confirmado para ${invoice.user.name} - €${invoice.finalAmount}`,
        metadata: {
          userId: invoice.userId,
          amount: invoice.finalAmount,
          propertiesActivated: activatedProperties.length,
          paymentReference
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Pago confirmado. ${activatedProperties.length} propiedad(es) activada(s).`,
      invoice: updatedInvoice,
      activatedProperties: activatedProperties.length
    })
    
  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}