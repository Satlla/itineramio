import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { verifyToken } from '../../../src/lib/auth'
import { sendEmail, emailTemplates } from '../../../src/lib/email-improved'

export async function POST(request: NextRequest) {
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

    const {
      planId,
      customPlanId,
      requestType,
      propertiesCount,
      paymentMethod,
      paymentReference,
      paymentProofUrl,
      totalAmount
    } = await request.json()

    // Validate required fields
    if (!requestType || !totalAmount || !paymentMethod || !paymentProofUrl) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, phone: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Get plan info
    let planInfo = null
    if (planId) {
      planInfo = await prisma.subscriptionPlan.findUnique({
        where: { id: planId },
        select: { name: true, priceMonthly: true }
      })
    }

    // Create subscription request
    const subscriptionRequest = await prisma.subscriptionRequest.create({
      data: {
        userId: user.id,
        planId,
        customPlanId,
        requestType,
        propertiesCount,
        totalAmount,
        paymentMethod,
        paymentReference,
        paymentProofUrl,
        status: 'PENDING',
        paidAt: new Date() // User claims they paid
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
      requestId: subscriptionRequest.id
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