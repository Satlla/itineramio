import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { getAdminUser } from '../../../../../../src/lib/admin-auth'
import { sendEmail, emailTemplates } from '../../../../../../src/lib/email-improved'
import { calculateProration, type ProrationCalculation } from '../../../../../../src/lib/proration-service'

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
      console.log(`❌ Subscription request ${id} already processed. Status: ${subscriptionRequest.status}`)
      const errorResponse = { error: 'Esta solicitud ya ha sido procesada' }
      console.log('Sending error response:', errorResponse)
      return NextResponse.json(errorResponse, { status: 400 })
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

    // Check for existing active subscription to apply proration
    const existingSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: subscriptionRequest.userId,
        status: 'ACTIVE',
        endDate: {
          gte: new Date() // Still active
        }
      },
      include: {
        plan: {
          select: { name: true, priceMonthly: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate proration if user has active subscription
    let prorationCalculation: ProrationCalculation | null = null
    let finalAmountToCharge = subscriptionRequest.totalAmount

    if (existingSubscription && existingSubscription.plan && subscriptionRequest.plan) {
      console.log('🔄 Existing subscription found, calculating proration...')

      try {
        // Determine current billing period from existing subscription
        const existingDuration = existingSubscription.endDate.getTime() - existingSubscription.startDate.getTime()
        const daysInExisting = existingDuration / (1000 * 60 * 60 * 24)

        let currentBillingPeriod: 'monthly' | 'biannual' | 'annual' = 'monthly'
        if (daysInExisting > 150 && daysInExisting < 250) {
          currentBillingPeriod = 'biannual'
        } else if (daysInExisting > 300) {
          currentBillingPeriod = 'annual'
        }

        // Convert new billing period to lowercase format
        const newBillingPeriod = (billingPeriod === 'BIANNUAL' ? 'biannual' :
                                  billingPeriod === 'ANNUAL' ? 'annual' : 'monthly') as 'monthly' | 'biannual' | 'annual'

        // Calculate proration
        prorationCalculation = calculateProration({
          currentSubscription: {
            planName: existingSubscription.plan.name,
            amountPaid: Number(existingSubscription.customPrice || existingSubscription.plan.priceMonthly),
            startDate: existingSubscription.startDate,
            endDate: existingSubscription.endDate
          },
          newPlan: {
            name: subscriptionRequest.plan.name,
            priceMonthly: subscriptionRequest.plan.priceMonthly,
            billingPeriod: newBillingPeriod
          },
          today: new Date()
        })

        finalAmountToCharge = prorationCalculation.finalPrice

        console.log('✅ Proration calculated:', {
          oldPlan: existingSubscription.plan.name,
          newPlan: subscriptionRequest.plan.name,
          creditAmount: prorationCalculation.creditAmount,
          finalPrice: prorationCalculation.finalPrice,
          daysRemaining: prorationCalculation.daysRemaining
        })

        // Mark old subscription as REPLACED
        await prisma.userSubscription.update({
          where: { id: existingSubscription.id },
          data: {
            status: 'REPLACED',
            notes: `Reemplazada por upgrade/downgrade. Crédito aplicado: €${prorationCalculation.creditAmount.toFixed(2)}`
          }
        })
      } catch (prorationError) {
        console.error('❌ Error calculating proration:', prorationError)
        // Continue without proration if calculation fails
        prorationCalculation = null
      }
    }

    // Create user subscription with billing period information
    const billingPeriodLabel =
      billingPeriod === 'BIANNUAL' ? 'Semestral' :
      billingPeriod === 'ANNUAL' ? 'Anual' : 'Mensual'

    const subscriptionNotes = [
      `Período: ${billingPeriodLabel}`,
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

    // Generate invoice with proration applied
    const invoiceNumber = `INV-${Date.now()}`
    const creditAmount = prorationCalculation ? prorationCalculation.creditAmount : 0
    const originalAmount = Number(subscriptionRequest.totalAmount)

    const invoice = await prisma.invoice.create({
      data: {
        userId: subscriptionRequest.userId,
        subscriptionId: userSubscription.id,
        invoiceNumber,
        amount: originalAmount,
        discountAmount: creditAmount, // Proration credit as discount
        finalAmount: Number(finalAmountToCharge),
        status: 'PAID',
        paymentMethod: subscriptionRequest.paymentMethod,
        paymentReference: subscriptionRequest.paymentReference,
        dueDate: startDate,
        paidDate: new Date(),
        createdBy: admin.adminId,
        notes: prorationCalculation
          ? `Factura con prorrateo aplicado. ${prorationCalculation.summary}`
          : `Factura generada automáticamente por aprobación de suscripción`
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
        adminNotes: notes ? `${notes}${billingInfo ? ` | ${billingInfo}` : ''}` : billingInfo
      }
    })

    // Update user subscription status
    await prisma.user.update({
      where: { id: subscriptionRequest.userId },
      data: {
        subscription: subscriptionRequest.plan?.name || 'CUSTOM'
      }
    })

    // Create notification for user with proration info
    const notificationMessage = prorationCalculation
      ? `Tu suscripción para ${subscriptionRequest.plan?.name || 'plan personalizado'} ha sido activada. ${prorationCalculation.summary}`
      : `Tu suscripción para ${subscriptionRequest.plan?.name || 'plan personalizado'} ha sido activada. Ya puedes crear más propiedades.`

    await prisma.notification.create({
      data: {
        userId: subscriptionRequest.userId,
        type: 'subscription_approved',
        title: '🎉 Suscripción activada',
        message: notificationMessage,
        data: {
          subscriptionId: userSubscription.id,
          invoiceId: invoice.id,
          planName: subscriptionRequest.plan?.name,
          hasProration: !!prorationCalculation,
          prorationCredit: prorationCalculation?.creditAmount || 0,
          finalAmount: Number(finalAmountToCharge)
        }
      }
    })

    // Log admin activity (optional - don't fail if logging fails)
    try {
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
    } catch (logError) {
      console.warn('⚠️ Could not create admin activity log:', logError)
      // Continue without logging - subscription already approved
    }

    // Send confirmation email to user with proration info
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
          totalAmount: Number(finalAmountToCharge).toFixed(2),
          dashboardUrl: `${process.env.NEXTAUTH_URL || 'https://www.itineramio.com'}/main`,
          prorationCredit: prorationCalculation?.creditAmount,
          prorationBreakdown: prorationCalculation
            ? `${prorationCalculation.breakdown.map(item => `${item.label}: ${item.value}`).join('\n')}`
            : undefined
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