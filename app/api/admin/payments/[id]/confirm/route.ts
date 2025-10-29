import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../../../src/lib/admin-auth'
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
    let months = 1
    
    // Try to parse notes as JSON, but handle plain text gracefully
    if (invoice.notes) {
      try {
        const notesData = JSON.parse(invoice.notes)
        properties = notesData.properties || []
        months = notesData.months || 1
      } catch (e) {
        // If notes is not JSON, it's plain text - no properties to activate
        console.log('Invoice notes is plain text, no properties to activate')
        properties = []
        months = 1
      }
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

    // Send property activation emails for each activated property
    for (const property of activatedProperties) {
      try {
        const activationEmailContent = emailTemplates.propertyActivated({
          userName: invoice.user.name || 'Usuario',
          propertyName: property.name,
          activatedBy: 'payment',
          subscriptionEndsAt: subscriptionEnd.toLocaleDateString('es-ES'),
          invoiceNumber: invoice.invoiceNumber
        })

        await sendEmail({
          to: invoice.user.email,
          subject: `🎉 Propiedad activada - ${property.name}`,
          html: activationEmailContent
        })
      } catch (emailError) {
        console.error(`Error sending activation email for property ${property.id}:`, emailError)
      }
    }

    // Log admin activity - use fallback admin if auth fails
    try {
      let adminId = authResult.adminId
      
      // If no admin ID from auth, find any admin user as fallback
      if (!adminId) {
        const fallbackAdmin = await prisma.user.findFirst({
          where: { isAdmin: true },
          select: { id: true }
        })
        adminId = fallbackAdmin?.id || 'system'
      }

      await prisma.adminActivityLog.create({
        data: {
          adminUserId: adminId,
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
    } catch (logError) {
      console.error('Error creating admin activity log:', logError)
      // Don't fail the payment confirmation if logging fails
    }

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