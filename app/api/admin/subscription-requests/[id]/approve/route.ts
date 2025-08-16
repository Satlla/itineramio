import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { getAdminUser } from '../../../../../../src/lib/admin-auth'
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
    const { notes } = await request.json()

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

    // Calculate subscription end date (1 month from now)
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)

    // Create user subscription
    const userSubscription = await prisma.userSubscription.create({
      data: {
        userId: subscriptionRequest.userId,
        planId: subscriptionRequest.planId,
        customPlanId: subscriptionRequest.customPlanId,
        status: 'ACTIVE',
        startDate,
        endDate,
        createdBy: admin.adminId,
        notes: notes || `Aprobado por admin: ${admin.email}`
      }
    })

    // Generate invoice
    const invoiceNumber = `INV-${Date.now()}`
    const invoice = await prisma.invoice.create({
      data: {
        userId: subscriptionRequest.userId,
        subscriptionId: userSubscription.id,
        invoiceNumber,
        amount: subscriptionRequest.totalAmount,
        discountAmount: 0,
        finalAmount: subscriptionRequest.totalAmount,
        status: 'PAID',
        paymentMethod: subscriptionRequest.paymentMethod,
        paymentReference: subscriptionRequest.paymentReference,
        dueDate: startDate,
        paidDate: new Date(),
        createdBy: admin.adminId,
        notes: `Factura generada automáticamente por aprobación de suscripción`
      }
    })

    // Update subscription request status
    await prisma.subscriptionRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        reviewedBy: admin.adminId,
        adminNotes: notes
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
    await prisma.notification.create({
      data: {
        userId: subscriptionRequest.userId,
        type: 'subscription_approved',
        title: '🎉 Suscripción activada',
        message: `Tu suscripción para ${subscriptionRequest.plan?.name || 'plan personalizado'} ha sido activada. Ya puedes crear más propiedades.`,
        data: {
          subscriptionId: userSubscription.id,
          invoiceId: invoice.id,
          planName: subscriptionRequest.plan?.name
        }
      }
    })

    // Log admin activity
    await prisma.adminActivityLog.create({
      data: {
        adminUserId: admin.adminId,
        action: 'APPROVE_SUBSCRIPTION',
        targetType: 'subscription_request',
        targetId: id,
        description: `Aprobó solicitud de suscripción para ${subscriptionRequest.user.name}`,
        metadata: {
          userId: subscriptionRequest.userId,
          planName: subscriptionRequest.plan?.name,
          totalAmount: Number(subscriptionRequest.totalAmount),
          invoiceId: invoice.id,
          subscriptionId: userSubscription.id
        }
      }
    })

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
          invoiceNumber,
          totalAmount: Number(subscriptionRequest.totalAmount).toFixed(2),
          dashboardUrl: `${process.env.NEXTAUTH_URL || 'https://www.itineramio.com'}/main`
        })
      })
    } catch (emailError) {
      console.error('Error sending approval email:', emailError)
      // Continue without email - subscription still approved
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitud aprobada correctamente',
      subscriptionId: userSubscription.id,
      invoiceId: invoice.id
    })

  } catch (error) {
    console.error('Error approving subscription request:', error)
    return NextResponse.json(
      { error: 'Error al aprobar la solicitud' },
      { status: 500 }
    )
  }
}