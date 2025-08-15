import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { verifyAdminToken } from '../../../../../../src/lib/admin-auth'
import { sendEmail, emailTemplates } from '../../../../../../src/lib/email-improved'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request)
    if (!authResult.isValid || !authResult.admin) {
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
          select: { name: true, priceMonthly: true }
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

    // Update subscription request status
    await prisma.subscriptionRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        reviewedBy: authResult.admin.id,
        adminNotes: notes || 'Solicitud rechazada por admin'
      }
    })

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: subscriptionRequest.userId,
        type: 'subscription_rejected',
        title: '❌ Solicitud de suscripción rechazada',
        message: `Tu solicitud de suscripción para ${subscriptionRequest.plan?.name || 'plan personalizado'} ha sido rechazada. ${notes ? 'Motivo: ' + notes : 'Contacta con soporte para más información.'}`,
        data: {
          requestId: id,
          planName: subscriptionRequest.plan?.name,
          rejectionReason: notes
        }
      }
    })

    // Log admin activity
    await prisma.adminActivityLog.create({
      data: {
        adminUserId: authResult.admin.id,
        action: 'REJECT_SUBSCRIPTION',
        targetType: 'subscription_request',
        targetId: id,
        description: `Rechazó solicitud de suscripción para ${subscriptionRequest.user.name}`,
        metadata: {
          userId: subscriptionRequest.userId,
          planName: subscriptionRequest.plan?.name,
          totalAmount: Number(subscriptionRequest.totalAmount),
          rejectionReason: notes
        }
      }
    })

    // Send rejection email to user
    try {
      await sendEmail({
        to: subscriptionRequest.user.email,
        subject: `❌ Solicitud de suscripción rechazada - ${subscriptionRequest.plan?.name || 'Plan personalizado'}`,
        html: emailTemplates.subscriptionRejected({
          userName: subscriptionRequest.user.name || 'Usuario',
          planName: subscriptionRequest.plan?.name || 'Plan personalizado',
          rejectionReason: notes || 'No se pudo verificar el pago',
          totalAmount: Number(subscriptionRequest.totalAmount).toFixed(2),
          supportEmail: 'hola@itineramio.com',
          retryUrl: `${process.env.NEXTAUTH_URL || 'https://www.itineramio.com'}/account/plans`
        })
      })
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError)
      // Continue without email - rejection still processed
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitud rechazada correctamente'
    })

  } catch (error) {
    console.error('Error rejecting subscription request:', error)
    return NextResponse.json(
      { error: 'Error al rechazar la solicitud' },
      { status: 500 }
    )
  }
}