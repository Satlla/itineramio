import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../../../src/lib/admin-auth'
import { sendEmail } from '../../../../../../src/lib/email'

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
    
    const { planId, sendEmail: shouldSendEmail, markAsPaid } = await request.json()
    
    if (!planId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Plan ID is required' 
      }, { status: 400 })
    }
    
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        subscriptions: {
          where: { status: 'active' },
          include: {
            plan: true
          }
        }
      }
    })
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 })
    }
    
    // Get the new plan
    const newPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    })
    
    if (!newPlan) {
      return NextResponse.json({ 
        success: false, 
        error: 'Plan not found' 
      }, { status: 404 })
    }
    
    // Cancel current subscription if exists
    if (user.subscriptions.length > 0) {
      await prisma.userSubscription.updateMany({
        where: {
          userId: params.id,
          status: 'active'
        },
        data: {
          status: 'cancelled',
          endDate: new Date()
        }
      })
    }
    
    // Create new subscription
    const newSubscription = await prisma.userSubscription.create({
      data: {
        userId: params.id,
        planId: planId,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        notes: markAsPaid ? 'Plan cambiado y marcado como pagado por administrador' : 'Plan cambiado por administrador'
      }
    })
    
    // Create invoice if marking as paid
    if (markAsPaid) {
      const invoiceNumber = await generateInvoiceNumber()
      
      await prisma.invoice.create({
        data: {
          userId: params.id,
          subscriptionId: newSubscription.id,
          invoiceNumber,
          amount: Number(newPlan.priceMonthly),
          discountAmount: 0,
          finalAmount: Number(newPlan.priceMonthly),
          status: 'paid',
          paidDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          paymentMethod: 'manual',
          notes: `Plan cambiado manualmente por administrador`
        }
      })
    }
    
    // Send email notification if requested
    if (shouldSendEmail && user.email) {
      const oldPlanName = user.subscriptions[0]?.plan?.name || 'Sin plan'
      
      try {
        // Log email attempt
        console.log(`📧 Sending plan change email to: ${user.email}`)
        
        await sendEmail({
          to: user.email,
          subject: '🎉 Tu plan ha sido actualizado - Itineramio',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
                .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
                .plan-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .button { display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">¡Tu plan ha sido actualizado!</h1>
                </div>
                <div class="content">
                  <p>Hola ${user.name || 'Usuario'},</p>
                  
                  <p>Te informamos que tu plan en Itineramio ha sido actualizado exitosamente.</p>
                  
                  <div class="plan-box">
                    <h3 style="margin-top: 0;">Detalles del cambio:</h3>
                    <p><strong>Plan anterior:</strong> ${oldPlanName}</p>
                    <p><strong>Nuevo plan:</strong> ${newPlan.name}</p>
                    <p><strong>Precio:</strong> €${newPlan.priceMonthly}/mes</p>
                    <p><strong>Mensajes IA incluidos:</strong> ${newPlan.aiMessagesIncluded}</p>
                    <p><strong>Propiedades máximas:</strong> ${newPlan.maxProperties}</p>
                  </div>
                  
                  <p>Tu nuevo plan ya está activo y puedes disfrutar de todas sus ventajas de inmediato.</p>
                  
                  ${markAsPaid ? '<p><strong>✅ Tu plan ha sido marcado como pagado. Se ha generado la factura correspondiente.</strong></p>' : ''}
                  
                  <a href="https://www.itineramio.com/account/billing" class="button">Ver detalles de mi plan</a>
                  
                  <div class="footer">
                    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                    <p>© ${new Date().getFullYear()} Itineramio. Todos los derechos reservados.</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `
        })
        
        console.log(`✅ Plan change email sent successfully to: ${user.email}`)
      } catch (emailError) {
        console.error('⚠️ Error sending email (will continue anyway):', emailError)
        // Continue even if email fails - this is not critical
        // Auto-responders or out-of-office messages should not block the plan change
      }
    }
    
    // Log activity
    const adminUser = await prisma.user.findFirst({
      where: { isAdmin: true },
      select: { id: true }
    })
    
    if (adminUser) {
      await prisma.adminActivityLog.create({
        data: {
          adminUserId: adminUser.id,
          action: 'user_plan_changed',
          targetType: 'user',
          targetId: params.id,
          description: `Changed user plan to ${newPlan.name}`,
          metadata: { 
            oldPlan: user.subscriptions[0]?.plan?.name || 'None',
            newPlan: newPlan.name,
            markAsPaid,
            emailSent: shouldSendEmail
          }
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Plan changed successfully'
    })
    
  } catch (error) {
    console.error('Error changing user plan:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

async function generateInvoiceNumber() {
  const year = new Date().getFullYear()
  
  const latestInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: `INV-${year}-`
      }
    },
    orderBy: {
      invoiceNumber: 'desc'
    }
  })

  let nextNumber = 1
  if (latestInvoice) {
    const currentNumber = parseInt(latestInvoice.invoiceNumber.split('-')[2])
    nextNumber = currentNumber + 1
  }

  return `INV-${year}-${nextNumber.toString().padStart(4, '0')}`
}