import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { getAdminUser, createActivityLog, getRequestInfo } from '../../../../../../src/lib/admin-auth'
import { sendEmail, emailTemplates } from '../../../../../../src/lib/email-improved'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { notes, reason } = await request.json()

    // Find the subscription request
    const subscriptionRequest = await prisma.subscriptionRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        plan: {
          select: { name: true, priceMonthly: true, maxProperties: true }
        }
      }
    })

    if (!subscriptionRequest) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }

    if (subscriptionRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Esta solicitud ya ha sido procesada' },
        { status: 400 }
      )
    }

    // Calculate subscription end date based on billing period
    const startDate = new Date()
    const endDate = new Date()

    // Determinar duración según billing period (desde metadata o adminNotes)
    let billingPeriod = 'MONTHLY'

    // Intentar obtener desde metadata
    if (subscriptionRequest.metadata && typeof subscriptionRequest.metadata === 'object') {
      const metadata = subscriptionRequest.metadata as any
      billingPeriod = metadata.billingPeriod || 'MONTHLY'
    }
    // Fallback: intentar extraer desde adminNotes
    else if (subscriptionRequest.adminNotes) {
      const match = subscriptionRequest.adminNotes.match(/Billing:\s*(\w+)/i)
      if (match) {
        billingPeriod = match[1]
      }
    }

    // Normalize billing period to handle case variations and "semiannual" variant
    billingPeriod = billingPeriod.toUpperCase()
    if (billingPeriod === 'SEMIANNUAL') {
      billingPeriod = 'BIANNUAL'
    }

    switch (billingPeriod) {
      case 'MONTHLY':
        endDate.setMonth(endDate.getMonth() + 1)
        break
      case 'BIANNUAL':
        endDate.setMonth(endDate.getMonth() + 6)
        break
      case 'ANNUAL':
        endDate.setFullYear(endDate.getFullYear() + 1)
        break
      default:
        endDate.setMonth(endDate.getMonth() + 1)
    }

    // Check for existing active subscription - mark as REPLACED
    const existingSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: subscriptionRequest.userId,
        status: 'ACTIVE',
        endDate: {
          gte: new Date() // Still active
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (existingSubscription) {
      // Mark old subscription as REPLACED
      await prisma.userSubscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: 'REPLACED',
          notes: `Reemplazada por nueva suscripción sin factura. Motivo: ${reason || 'No especificado'}`
        }
      })
    }

    // Create user subscription with billing period information - NO INVOICE
    const billingPeriodLabel =
      billingPeriod === 'BIANNUAL' ? 'Semestral' :
      billingPeriod === 'ANNUAL' ? 'Anual' : 'Mensual'

    const subscriptionNotes = [
      `Período: ${billingPeriodLabel}`,
      `⚠️ SIN FACTURA - Motivo: ${reason || 'Cortesía administrativa'}`,
      notes || `Aprobado por admin: ${admin.email}`
    ].join(' | ')

    const userSubscription = await prisma.userSubscription.create({
      data: {
        userId: subscriptionRequest.userId,
        planId: subscriptionRequest.planId,
        customPlanId: subscriptionRequest.customPlanId,
        status: 'ACTIVE',
        startDate,
        endDate,
        createdBy: admin.adminId,
        notes: subscriptionNotes
      }
    })

    // Update subscription request status (preservar billing period info)
    const originalAdminNotes = subscriptionRequest.adminNotes || ''
    const billingInfoMatch = originalAdminNotes.match(/Billing:\s*(\w+)/)
    const billingInfo = billingInfoMatch ? billingInfoMatch[0] : ''

    await prisma.subscriptionRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        reviewedBy: admin.adminId,
        adminNotes: notes ? `${notes}${billingInfo ? ` | ${billingInfo}` : ''} | SIN FACTURA - ${reason || 'Cortesía'}` : `${billingInfo} | SIN FACTURA - ${reason || 'Cortesía'}`
      }
    })

    // Update user subscription status
    await prisma.user.update({
      where: { id: subscriptionRequest.userId },
      data: {
        subscription: subscriptionRequest.plan?.name || 'CUSTOM'
      }
    })

    // Create notification for user
    const notificationMessage = `Tu suscripción para ${subscriptionRequest.plan?.name || 'plan personalizado'} ha sido activada. Ya puedes crear más propiedades.`

    await prisma.notification.create({
      data: {
        userId: subscriptionRequest.userId,
        type: 'subscription_approved',
        title: '🎉 Suscripción activada',
        message: notificationMessage,
        data: {
          subscriptionId: userSubscription.id,
          planName: subscriptionRequest.plan?.name,
          noInvoice: true,
          reason: reason
        }
      }
    })

    // Log admin activity (optional - don't fail if logging fails)
    try {
      const { ipAddress, userAgent } = getRequestInfo(request)
      await createActivityLog({
        adminId: admin.adminId,
        action: 'APPROVE_SUBSCRIPTION_NO_INVOICE',
        targetType: 'subscription_request',
        targetId: id,
        description: `Aprobó solicitud de suscripción SIN FACTURA para ${subscriptionRequest.user.name}`,
        metadata: {
          userId: subscriptionRequest.userId,
          planName: subscriptionRequest.plan?.name,
          subscriptionId: userSubscription.id,
          reason: reason || 'No especificado'
        },
        ipAddress,
        userAgent,
      })
    } catch (logError) {
      console.warn('⚠️ Could not create admin activity log:', logError)
      // Continue without logging - subscription already approved
    }

    // Send confirmation email to user
    try {
      await sendEmail({
        to: subscriptionRequest.user.email,
        subject: `🎉 Suscripción activada - ${subscriptionRequest.plan?.name || 'Plan personalizado'}`,
        html: emailTemplates.subscriptionApproved({
          userName: subscriptionRequest.user.name || 'Usuario',
          planName: subscriptionRequest.plan?.name || 'Plan personalizado',
          startDate: startDate.toLocaleDateString('es-ES'),
          endDate: endDate.toLocaleDateString('es-ES'),
          invoiceNumber: 'N/A - Sin factura',
          totalAmount: '0.00',
          dashboardUrl: `${process.env.NEXTAUTH_URL || 'https://www.itineramio.com'}/main`
        })
      })
    } catch (emailError) {
      console.error('Error sending approval email:', emailError)
      // Continue without email - subscription still approved
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitud aprobada correctamente sin factura',
      subscriptionId: userSubscription.id,
      noInvoice: true
    })

  } catch (error) {
    console.error('Error approving subscription request without invoice:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('Error details:', errorMessage)
    return NextResponse.json(
      {
        error: 'Error al aprobar la solicitud',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
