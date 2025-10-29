import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { verifyToken } from '../../../src/lib/auth'
import { sendEmail, emailTemplates } from '../../../src/lib/email-improved'
import { generatePaymentReference } from '../../../src/lib/property-number-generator'

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📋 Subscription request body:', JSON.stringify(body, null, 2))

    const {
      // Support both naming conventions
      planId: planIdFromBody,
      planCode,
      customPlanId,
      requestType: requestTypeFromBody,
      propertiesCount: propertiesCountFromBody,
      properties,
      paymentMethod,
      paymentReference,
      paymentProofUrl,
      totalAmount: totalAmountFromBody,
      amount,
      billingPeriod,
      prorationData
    } = body

    // Normalize field names
    const planId = planIdFromBody || planCode
    const requestType = requestTypeFromBody || 'subscription'
    const propertiesCount = propertiesCountFromBody || properties
    const totalAmount = totalAmountFromBody || amount

    // Validate required fields (paymentProofUrl is optional)
    if (!totalAmount || !paymentMethod) {
      console.error('❌ Missing required fields:', { totalAmount, paymentMethod, body })
      return NextResponse.json(
        { error: 'Faltan campos requeridos: ' + [
          !totalAmount && 'importe total',
          !paymentMethod && 'método de pago'
        ].filter(Boolean).join(', ') },
        { status: 400 }
      )
    }

    // Get user info with billing data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        billingInfo: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // ⚠️ CRITICAL: Validate billing data is complete before allowing subscription
    const billingInfo = user.billingInfo as any

    // Check for name based on entity type
    const hasValidName = !!(
      billingInfo?.companyName ||
      billingInfo?.tradeName ||
      (billingInfo?.firstName && billingInfo?.lastName)
    )

    // Check for tax ID based on entity type
    const hasValidTaxId = !!(
      billingInfo?.nationalId ||
      billingInfo?.taxId ||
      billingInfo?.companyTaxId
    )

    const isBillingComplete = !!(
      billingInfo &&
      hasValidName &&
      hasValidTaxId &&
      billingInfo?.email &&
      billingInfo?.address &&
      billingInfo?.postalCode &&
      billingInfo?.city &&
      billingInfo?.country
    )

    if (!isBillingComplete) {
      console.error('❌ BILLING-DATA-INCOMPLETE: User attempted to subscribe without complete billing data', {
        hasValidName,
        hasValidTaxId,
        hasEmail: !!billingInfo?.email,
        hasAddress: !!billingInfo?.address,
        billingInfo
      })
      return NextResponse.json({
        error: 'Datos de facturación incompletos',
        details: 'Debes completar tus datos de facturación antes de realizar una suscripción.',
        hint: 'Ve a Cuenta → Facturación y completa todos los campos requeridos.'
      }, { status: 400 })
    }

    console.log('✅ BILLING-DATA-VALIDATED: User has complete billing data')

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

    // Get plan info - support both planId (database ID) and planCode (BASIC, HOST, etc.)
    let planInfo = null
    let actualPlanId = planId

    if (planCode) {
      // Look up plan by code
      planInfo = await prisma.subscriptionPlan.findFirst({
        where: { code: planCode },
        select: { id: true, name: true, priceMonthly: true }
      })
      if (planInfo) {
        actualPlanId = planInfo.id
      }
    } else if (planId) {
      // Look up plan by ID
      planInfo = await prisma.subscriptionPlan.findUnique({
        where: { id: planId },
        select: { id: true, name: true, priceMonthly: true }
      })
    }

    // Generate payment reference if not provided (PAY-XXXXXX format)
    const finalPaymentReference = paymentReference || generatePaymentReference()

    // Create subscription request with billing period in metadata
    const subscriptionRequest = await prisma.subscriptionRequest.create({
      data: {
        userId: user.id,
        planId: actualPlanId,
        customPlanId,
        requestType,
        propertiesCount,
        totalAmount,
        paymentMethod,
        paymentReference: finalPaymentReference,
        paymentProofUrl,
        status: 'PENDING',
        paidAt: new Date(), // User claims they paid
        metadata: billingPeriod ? { billingPeriod } : undefined
      },
      include: {
        user: {
          select: { name: true, email: true, phone: true }
        },
        plan: {
          select: { name: true, priceMonthly: true }
        }
      }
    })

    // Send notification email to admins
    try {
      const adminEmails = await getAdminEmails()
      
      if (adminEmails.length > 0) {
        const planName = planInfo?.name || 'Plan personalizado'
        const propertiesText = propertiesCount ? ` (${propertiesCount} propiedades)` : ''
        
        await sendEmail({
          to: adminEmails,
          subject: `🎯 Nueva solicitud de suscripción: €${Number(totalAmount).toFixed(2)} - ${user.name}`,
          html: emailTemplates.subscriptionRequestNotification({
            userName: user.name || 'Usuario',
            userEmail: user.email,
            planName: planName + propertiesText,
            totalAmount: Number(totalAmount).toFixed(2),
            paymentMethod: paymentMethod === 'BIZUM' ? 'Bizum' : 'Transferencia bancaria',
            paymentReference: paymentReference || 'No especificada',
            requestType: 'Suscripción',
            requestId: subscriptionRequest.id,
            adminUrl: `${process.env.NEXTAUTH_URL || 'https://www.itineramio.com'}/admin/subscription-requests`
          })
        })

        console.log('✅ Admin notification email sent for subscription request:', subscriptionRequest.id)
      }
    } catch (emailError) {
      console.error('❌ Error sending admin notification email:', emailError)
      // Continue without email - request still created
    }

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'subscription_request_created',
        title: 'Solicitud de suscripción enviada',
        message: `Tu solicitud para ${planInfo?.name || 'plan personalizado'} ha sido enviada. Revisaremos tu pago en 24-48 horas.`,
        data: {
          requestId: subscriptionRequest.id,
          planName: planInfo?.name,
          totalAmount: Number(totalAmount).toFixed(2)
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Solicitud de suscripción creada correctamente',
      requestId: subscriptionRequest.id,
      paymentReference: finalPaymentReference
    })

  } catch (error) {
    console.error('Error creating subscription request:', error)
    return NextResponse.json(
      { error: 'Error al crear la solicitud de suscripción' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch user's subscription requests
export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const requests = await prisma.subscriptionRequest.findMany({
      where: { userId: decoded.userId },
      include: {
        plan: {
          select: { name: true, priceMonthly: true }
        }
      },
      orderBy: { requestedAt: 'desc' }
    })

    return NextResponse.json(requests)

  } catch (error) {
    console.error('Error fetching subscription requests:', error)
    return NextResponse.json(
      { error: 'Error al obtener las solicitudes' },
      { status: 500 }
    )
  }
}

async function getAdminEmails(): Promise<string[]> {
  try {
    const admins = await prisma.admin.findMany({
      where: { isActive: true },
      select: { email: true }
    })
    return admins.map(admin => admin.email)
  } catch (error) {
    console.error('Error fetching admin emails:', error)
    return []
  }
}