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

    const { months, reason, plan, amount } = await request.json()
    
    if (!months || months < 1 || months > 12) {
      return NextResponse.json({ 
        error: 'Months must be between 1 and 12' 
      }, { status: 400 })
    }

    if (!plan || !amount || amount <= 0) {
      return NextResponse.json({ 
        error: 'Plan and amount are required' 
      }, { status: 400 })
    }

    // Get the property
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (property.status === 'ACTIVE') {
      return NextResponse.json({ error: 'Property is already active' }, { status: 400 })
    }

    // Calculate subscription end date
    const subscriptionEnd = new Date()
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + months)

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`

    // Create invoice first
    const invoice = await prisma.invoice.create({
      data: {
        userId: property.hostId,
        invoiceNumber,
        amount: amount,
        discountAmount: 0,
        finalAmount: amount,
        status: 'PENDING',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        notes: JSON.stringify({
          properties: [{
            id: property.id,
            name: property.name,
            type: property.type
          }],
          months: months,
          plan: plan,
          description: `Activación de propiedad con factura - ${reason || 'Activación manual'}`
        })
      }
    })

    // Activate the property
    const updatedProperty = await prisma.property.update({
      where: { id: params.id },
      data: {
        status: 'ACTIVE',
        subscriptionEndsAt: subscriptionEnd,
        lastPaymentDate: new Date(),
        isPublished: true,
        publishedAt: new Date()
      }
    })

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: property.hostId,
        type: 'PROPERTY_ACTIVATED_WITH_INVOICE',
        title: '🎉 Propiedad activada (Factura generada)',
        message: `Tu propiedad "${property.name}" ha sido activada y se ha generado la factura ${invoiceNumber}. Válida hasta ${subscriptionEnd.toLocaleDateString()}.`,
        data: {
          propertyId: property.id,
          propertyName: property.name,
          subscriptionEnd: subscriptionEnd.toISOString(),
          activatedBy: 'admin',
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          reason: reason || null
        }
      }
    })

    // Send property activation email
    try {
      const activationEmailContent = emailTemplates.propertyActivated({
        userName: property.host.name || 'Usuario',
        propertyName: property.name,
        activatedBy: 'admin',
        subscriptionEndsAt: subscriptionEnd.toLocaleDateString('es-ES'),
        reason: reason || undefined,
        invoiceNumber: invoice.invoiceNumber
      })

      await sendEmail({
        to: property.host.email,
        subject: `🎉 Propiedad activada - ${property.name}`,
        html: activationEmailContent
      })
    } catch (emailError) {
      console.error('Error sending activation email:', emailError)
    }

    // Send invoice notification email
    try {
      const invoiceEmailContent = emailTemplates.invoiceNotification({
        userName: property.host.name || 'Usuario',
        invoiceNumber: invoice.invoiceNumber,
        amount: Number(invoice.finalAmount).toFixed(2),
        dueDate: new Date(invoice.dueDate).toLocaleDateString('es-ES'),
        status: 'PENDING',
        isPaid: false,
        downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'}/api/invoices/${invoice.id}/download`
      })

      await sendEmail({
        to: property.host.email,
        subject: `📄 Nueva factura ${invoice.invoiceNumber} - Itineramio`,
        html: invoiceEmailContent
      })
    } catch (emailError) {
      console.error('Error sending invoice email:', emailError)
    }

    // Log admin activity
    try {
      const { ipAddress, userAgent } = getRequestInfo(request)
      await createActivityLog({
        adminId: authResult.adminId,
        action: 'PROPERTY_ACTIVATED_WITH_INVOICE',
        targetType: 'property',
        targetId: property.id,
        description: `Propiedad "${property.name}" activada con factura ${invoice.invoiceNumber} para ${property.host.name}`,
        metadata: {
          propertyId: property.id,
          propertyName: property.name,
          userId: property.hostId,
          userEmail: property.host.email,
          months,
          subscriptionEnd: subscriptionEnd.toISOString(),
          reason: reason || null,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.finalAmount,
          plan
        },
        ipAddress,
        userAgent,
      })
    } catch (logError) {
      console.error('Error creating admin activity log:', logError)
      // Don't fail the activation if logging fails
    }

    return NextResponse.json({
      success: true,
      message: `Propiedad activada y factura ${invoice.invoiceNumber} generada. Notificaciones enviadas al usuario.`,
      property: {
        id: updatedProperty.id,
        name: updatedProperty.name,
        status: updatedProperty.status,
        subscriptionEndsAt: updatedProperty.subscriptionEndsAt
      },
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.finalAmount,
        status: invoice.status,
        dueDate: invoice.dueDate
      }
    })
    
  } catch (error) {
    console.error('Error activating property with invoice:', error)
    console.error('Property ID:', params.id)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}