import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { sendEmail, emailTemplates } from '../../../src/lib/email-improved'

export async function POST(request: NextRequest) {
  try {
    const {
      moduleCode,
      billingPeriod,
      paymentMethod,
      paymentReference,
      paymentProofUrl,
      totalAmount,
      couponCode,
      userEmail,
      userName
    } = await request.json()

    // Validate required fields
    if (!moduleCode || !totalAmount || !paymentMethod || !paymentProofUrl || !userEmail) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, name: true, email: true, phone: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Check if user already has a pending request for this module
    const existingPending = await prisma.subscriptionRequest.findFirst({
      where: {
        userId: user.id,
        status: 'PENDING',
        moduleType: 'GESTION'
      }
    })

    if (existingPending) {
      return NextResponse.json({
        error: 'Ya tienes una solicitud pendiente para el módulo Gestión',
        details: 'Debes esperar a que se apruebe o rechace tu solicitud actual.'
      }, { status: 409 })
    }

    // Map billing period
    const billingPeriodMapping: Record<string, string> = {
      'MONTHLY': 'MONTHLY',
      'SEMESTRAL': 'SEMESTRAL',
      'YEARLY': 'YEARLY'
    }
    const normalizedPeriod = billingPeriodMapping[billingPeriod] || 'MONTHLY'

    const billingPeriodLabel = normalizedPeriod === 'YEARLY' ? 'Anual' :
      normalizedPeriod === 'SEMESTRAL' ? 'Semestral' : 'Mensual'

    // Create subscription request with moduleType GESTION (no planId)
    const subscriptionRequest = await prisma.subscriptionRequest.create({
      data: {
        userId: user.id,
        planId: null,
        requestType: 'MODULE',
        totalAmount: Number(totalAmount),
        paymentMethod,
        paymentReference: paymentReference || null,
        paymentProofUrl,
        status: 'PENDING',
        paidAt: new Date(),
        moduleType: 'GESTION',
        metadata: {
          billingPeriod: normalizedPeriod,
          moduleCode,
          ...(couponCode ? { couponCode } : {})
        },
        adminNotes: `Módulo: GESTION | Billing: ${normalizedPeriod}${couponCode ? ` | Cupón: ${couponCode}` : ''}`
      }
    })

    // Send notification email to admins
    try {
      const adminEmails = ['hola@itineramio.com', 'alejandrosatlla@gmail.com']

      const additionalAdmins = await prisma.admin.findMany({
        where: { isActive: true },
        select: { email: true }
      }).then(admins => admins.map(a => a.email).filter(e => !adminEmails.includes(e)))

      adminEmails.push(...additionalAdmins)

      await sendEmail({
        to: adminEmails,
        subject: `🎯 Nueva solicitud de Gestión: €${Number(totalAmount).toFixed(2)} - ${user.name || userEmail}`,
        html: emailTemplates.subscriptionRequestNotification({
          userName: user.name || userName || 'Usuario',
          userEmail: user.email,
          planName: `Módulo Gestión (${billingPeriodLabel})`,
          totalAmount: Number(totalAmount).toFixed(2),
          paymentMethod: paymentMethod === 'BIZUM' ? 'Bizum' : 'Transferencia bancaria',
          paymentReference: paymentReference || 'No especificada',
          requestType: 'Módulo Gestión',
          requestId: subscriptionRequest.id,
          adminUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'}/admin/subscription-requests`
        })
      })
    } catch (emailError) {
      console.error('Error sending admin notification:', emailError)
    }

    // Create notification for user
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'subscription_request_created',
          title: 'Solicitud de Gestión enviada',
          message: `Tu solicitud para el módulo Gestión ha sido enviada correctamente. Revisaremos tu pago en 24-48 horas.`,
          data: {
            requestId: subscriptionRequest.id,
            moduleCode: 'GESTION',
            totalAmount: Number(totalAmount).toFixed(2),
            paymentReference,
            billingPeriod: normalizedPeriod
          }
        }
      })
    } catch (notifError) {
      console.error('Error creating notification:', notifError)
    }

    // Send confirmation email to user
    try {
      await sendEmail({
        to: [user.email],
        subject: `Solicitud de Gestión recibida - Itineramio`,
        html: emailTemplates.subscriptionRequestConfirmation({
          userName: user.name || userName || 'Usuario',
          planName: `Módulo Gestión (${billingPeriodLabel})`,
          totalAmount: Number(totalAmount).toFixed(2),
          paymentMethod: paymentMethod === 'BIZUM' ? 'Bizum' : 'Transferencia bancaria',
          paymentReference: paymentReference || 'No especificada',
          requestId: subscriptionRequest.id,
          supportEmail: 'hola@itineramio.com',
          requestType: 'módulo Gestión'
        })
      })
    } catch (userEmailError) {
      console.error('Error sending user email:', userEmailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitud creada correctamente',
      requestId: subscriptionRequest.id
    })

  } catch (error) {
    console.error('Error creating module request:', error)
    return NextResponse.json(
      { error: 'Error al crear la solicitud', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
