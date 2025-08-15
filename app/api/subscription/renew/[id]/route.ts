import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { verifyToken } from '../../../../../src/lib/auth'
import { sendEmail, emailTemplates } from '../../../../../src/lib/email-improved'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify user authentication
    const authResult = await verifyToken(request)
    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { paymentMethod, paymentReference, paymentProofUrl } = await request.json()

    // Find the subscription to renew
    const subscription = await prisma.userSubscription.findUnique({
      where: { 
        id,
        userId: authResult.user.id // Ensure user owns this subscription
      },
      include: {
        plan: {
          select: {
            name: true,
            priceMonthly: true,
            maxProperties: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      )
    }

    if (!subscription.plan) {
      return NextResponse.json(
        { error: 'Plan de la suscripción no encontrado' },
        { status: 404 }
      )
    }

    // Create a subscription renewal request
    const renewalRequest = await prisma.subscriptionRequest.create({
      data: {
        userId: authResult.user.id,
        planId: subscription.planId,
        customPlanId: subscription.customPlanId,
        requestType: 'RENEWAL',
        totalAmount: subscription.plan.priceMonthly,
        paymentMethod: paymentMethod || 'BIZUM',
        paymentReference,
        paymentProofUrl,
        requestedAt: new Date(),
        paidAt: new Date(),
        renewalFor: subscription.id,
        notes: `Renovación de suscripción ${subscription.id}`
      }
    })

    // Send notification email to admins
    try {
      await sendEmail({
        to: 'admin@itineramio.com',
        subject: `🔄 Nueva renovación de suscripción - ${subscription.plan.name}`,
        html: emailTemplates.subscriptionRequestNotification({
          userName: subscription.user.name || 'Usuario',
          userEmail: subscription.user.email,
          planName: subscription.plan.name,
          totalAmount: Number(subscription.plan.priceMonthly).toFixed(2),
          paymentMethod: paymentMethod || 'BIZUM',
          paymentReference: paymentReference || 'No especificada',
          requestType: 'Renovación',
          requestId: renewalRequest.id,
          adminUrl: `${process.env.NEXTAUTH_URL || 'https://www.itineramio.com'}/admin/subscription-requests`
        })
      })
    } catch (emailError) {
      console.error('Error sending admin notification email:', emailError)
      // Continue without email - renewal request still created
    }

    // Send confirmation email to user
    try {
      await sendEmail({
        to: subscription.user.email,
        subject: `🔄 Solicitud de renovación recibida - ${subscription.plan.name}`,
        html: emailTemplates.subscriptionRequestConfirmation({
          userName: subscription.user.name || 'Usuario',
          planName: subscription.plan.name,
          totalAmount: Number(subscription.plan.priceMonthly).toFixed(2),
          paymentMethod: paymentMethod || 'BIZUM',
          paymentReference: paymentReference || 'No especificada',
          requestId: renewalRequest.id,
          supportEmail: 'hola@itineramio.com',
          requestType: 'renovación'
        })
      })
    } catch (emailError) {
      console.error('Error sending user confirmation email:', emailError)
      // Continue without email - renewal request still created
    }

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: authResult.user.id,
        type: 'subscription_renewal_requested',
        title: '🔄 Renovación solicitada',
        message: `Tu solicitud de renovación para ${subscription.plan.name} ha sido recibida y está siendo procesada.`,
        data: {
          renewalRequestId: renewalRequest.id,
          originalSubscriptionId: subscription.id,
          planName: subscription.plan.name
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Solicitud de renovación creada correctamente',
      renewalRequestId: renewalRequest.id,
      originalSubscriptionId: subscription.id
    })

  } catch (error) {
    console.error('Error processing subscription renewal:', error)
    return NextResponse.json(
      { error: 'Error al procesar la renovación' },
      { status: 500 }
    )
  }
}