import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { sendEmail, emailTemplates } from '../../../src/lib/email-improved'

/**
 * Endpoint simplificado para crear solicitudes de suscripción desde checkout manual
 * No requiere JWT auth - recibe info del usuario en el body
 */
export async function POST(request: NextRequest) {
  try {
    const {
      planCode,
      billingPeriod,
      propertiesCount,
      paymentMethod,
      paymentReference,
      paymentProofUrl,
      totalAmount,
      couponCode,
      discountAmount,
      userEmail,
      userName
    } = await request.json()

    console.log('📥 Subscription request received:', {
      planCode,
      billingPeriod,
      propertiesCount,
      paymentMethod,
      totalAmount,
      couponCode,
      userEmail,
      userName,
      paymentReference,
      paymentProofUrl
    })

    // Validate required fields
    if (!planCode || !totalAmount || !paymentMethod || !paymentProofUrl || !userEmail) {
      console.error('❌ Missing required fields:', { planCode, totalAmount, paymentMethod, paymentProofUrl, userEmail })
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    console.log('✅ Validation passed, searching for user...')

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, name: true, email: true, phone: true }
    })

    if (!user) {
      console.error('❌ User not found:', userEmail)
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    console.log('✅ User found:', user.id, user.email)

    // Check if user already has a pending subscription request
    const existingPendingRequest = await prisma.subscriptionRequest.findFirst({
      where: {
        userId: user.id,
        status: 'PENDING'
      },
      select: {
        id: true,
        requestedAt: true,
        totalAmount: true,
        paymentMethod: true,
        plan: {
          select: { name: true }
        }
      }
    })

    if (existingPendingRequest) {
      console.error('❌ User already has a pending subscription request:', existingPendingRequest.id)
      return NextResponse.json({
        error: 'Ya tienes una solicitud de suscripción pendiente',
        details: 'Debes esperar a que se apruebe o rechace tu solicitud actual antes de crear una nueva.',
        existingRequest: {
          id: existingPendingRequest.id,
          requestedAt: existingPendingRequest.requestedAt,
          totalAmount: existingPendingRequest.totalAmount,
          paymentMethod: existingPendingRequest.paymentMethod,
          planName: existingPendingRequest.plan?.name || 'Plan personalizado'
        }
      }, { status: 409 }) // 409 Conflict
    }

    console.log('🔍 Searching for plan with code:', planCode)

    // Find plan by code
    const plan = await prisma.subscriptionPlan.findFirst({
      where: { code: planCode },
      select: { id: true, name: true, code: true, priceMonthly: true }
    })

    if (!plan) {
      console.error('❌ Plan not found:', planCode)
      return NextResponse.json(
        { error: `Plan no encontrado: ${planCode}` },
        { status: 404 }
      )
    }

    console.log('✅ Plan found:', plan.id, plan.name, plan.code)

    // Map billing period from URL format to DB format
    const billingPeriodMapping: Record<string, 'MONTHLY' | 'BIANNUAL' | 'ANNUAL'> = {
      'monthly': 'MONTHLY',
      'biannual': 'BIANNUAL',
      'annual': 'ANNUAL',
      '6_months': 'BIANNUAL',
      '12_months': 'ANNUAL'
    }

    const normalizedBillingPeriod = billingPeriodMapping[billingPeriod] || 'MONTHLY'

    console.log('📝 Creating subscription request with data:', {
      userId: user.id,
      planId: plan.id,
      propertiesCount,
      totalAmount,
      billingPeriod: normalizedBillingPeriod,
      paymentMethod,
      paymentProofUrl
    })

    // Preparar metadata solo si hay datos
    const metadataObj: any = {
      billingPeriod: normalizedBillingPeriod
    }

    if (couponCode) {
      metadataObj.couponCode = couponCode
      metadataObj.discountAmount = Number(discountAmount || 0)
      metadataObj.originalPrice = Number(totalAmount) + Number(discountAmount || 0)
    }

    // Create subscription request
    const subscriptionRequest = await prisma.subscriptionRequest.create({
      data: {
        userId: user.id,
        planId: plan.id,
        requestType: 'PLAN',
        propertiesCount: propertiesCount || 1,
        totalAmount: Number(totalAmount),
        paymentMethod: paymentMethod as 'BIZUM' | 'TRANSFER' | 'CARD',
        paymentReference: paymentReference || null,
        paymentProofUrl,
        status: 'PENDING',
        paidAt: new Date(),
        adminNotes: `Billing: ${normalizedBillingPeriod}${couponCode ? ` | Cupón: ${couponCode}` : ''}` // Fallback si metadata no funciona
      },
      include: {
        user: {
          select: { name: true, email: true, phone: true }
        },
        plan: {
          select: { name: true, code: true, priceMonthly: true }
        }
      }
    })

    console.log('✅ Subscription request created:', subscriptionRequest.id)

    // 1. NOTIFICACIÓN AL BACKOFFICE (EMAIL A ADMINS)
    try {
      // SIEMPRE enviar a hola@itineramio.com como prioridad
      const adminEmails = ['hola@itineramio.com']

      // Intentar obtener emails adicionales de admins
      const additionalAdmins = await getAdminEmails()
      adminEmails.push(...additionalAdmins.filter(email => email !== 'hola@itineramio.com'))

      const planDetails = `${plan.name} (${normalizedBillingPeriod})`
      const propertiesText = propertiesCount ? ` - ${propertiesCount} propiedades` : ''
      const couponText = couponCode ? ` - Cupón: ${couponCode} (-€${Number(discountAmount).toFixed(2)})` : ''

      await sendEmail({
        to: adminEmails,
        subject: `🎯 Nueva solicitud de suscripción: €${Number(totalAmount).toFixed(2)} - ${user.name || userEmail}`,
        html: emailTemplates.subscriptionRequestNotification({
          userName: user.name || userName || 'Usuario',
          userEmail: user.email,
          planName: planDetails + propertiesText + couponText,
          totalAmount: Number(totalAmount).toFixed(2),
          paymentMethod: paymentMethod === 'BIZUM' ? 'Bizum' : paymentMethod === 'TRANSFER' ? 'Transferencia bancaria' : 'Tarjeta',
          paymentReference: paymentReference || 'No especificada',
          requestType: 'Suscripción',
          requestId: subscriptionRequest.id,
          adminUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'}/admin/subscription-requests`
        })
      })

      console.log('✅ Email de notificación enviado a backoffice:', adminEmails)
    } catch (emailError) {
      console.error('❌ Error enviando email a backoffice:', emailError)
      // Continuar sin email - la solicitud ya fue creada
    }

    // 2. NOTIFICACIÓN AL USUARIO (CAMPANITA)
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'subscription_request_created',
          title: 'Solicitud de suscripción enviada',
          message: `Tu solicitud para ${plan.name} ha sido enviada correctamente. Revisaremos tu pago en 24-48 horas y te notificaremos cuando esté activo.`,
          data: {
            requestId: subscriptionRequest.id,
            planName: plan.name,
            planCode: plan.code,
            totalAmount: Number(totalAmount).toFixed(2),
            paymentReference,
            billingPeriod: normalizedBillingPeriod
          }
        }
      })

      console.log('✅ Notificación de campanita creada para usuario:', user.id)
    } catch (notifError) {
      console.error('❌ Error creando notificación de campanita:', notifError)
    }

    // 3. EMAIL DE CONFIRMACIÓN AL USUARIO
    try {
      const billingPeriodText = normalizedBillingPeriod === 'MONTHLY' ? 'mensual' : normalizedBillingPeriod === 'BIANNUAL' ? 'semestral (6 meses)' : 'anual (12 meses)'

      await sendEmail({
        to: [user.email],
        subject: `Solicitud de suscripción recibida - ${plan.name}`,
        html: emailTemplates.subscriptionRequestConfirmation({
          userName: user.name || userName || 'Usuario',
          planName: `${plan.name} (${billingPeriodText})`,
          totalAmount: Number(totalAmount).toFixed(2),
          paymentMethod: paymentMethod === 'BIZUM' ? 'Bizum' : paymentMethod === 'TRANSFER' ? 'Transferencia bancaria' : 'Tarjeta',
          paymentReference: paymentReference || 'No especificada',
          requestId: subscriptionRequest.id,
          supportEmail: 'hola@itineramio.com',
          requestType: 'suscripción'
        })
      })

      console.log('✅ Email de confirmación enviado a usuario:', user.email)
    } catch (userEmailError) {
      console.error('❌ Error enviando email de confirmación a usuario:', userEmailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitud de suscripción creada correctamente',
      requestId: subscriptionRequest.id,
      data: {
        planName: plan.name,
        totalAmount: Number(totalAmount).toFixed(2),
        paymentReference,
        status: 'PENDING'
      }
    })

  } catch (error) {
    console.error('❌ Error creating subscription request:', error)
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      {
        error: 'Error al crear la solicitud de suscripción',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

/**
 * Obtener emails de administradores activos
 */
async function getAdminEmails(): Promise<string[]> {
  try {
    const admins = await prisma.admin.findMany({
      where: { isActive: true },
      select: { email: true }
    })

    // Fallback si no hay admins en BD
    if (admins.length === 0) {
      return ['info@mrbarriot.com', 'hola@itineramio.com']
    }

    return admins.map(admin => admin.email)
  } catch (error) {
    console.error('Error fetching admin emails:', error)
    // Fallback
    return ['info@mrbarriot.com', 'hola@itineramio.com']
  }
}
