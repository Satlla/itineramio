import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyToken } from '../../../../src/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 })
    }
    
    const decoded = verifyToken(token)
    const { 
      propertyIds,
      months = 1,
      couponCode,
      paymentMethod = 'TRANSFER' // TRANSFER or BIZUM
    } = await request.json()
    
    if (!propertyIds || propertyIds.length === 0) {
      return NextResponse.json({ 
        error: 'Debes seleccionar al menos una propiedad' 
      }, { status: 400 })
    }
    
    // Get user data with billing info
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        billingAddress: true,
        billingCity: true,
        billingCountry: true,
        billingPostalCode: true,
        vatNumber: true
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Get properties to activate
    const properties = await prisma.property.findMany({
      where: {
        id: { in: propertyIds },
        hostId: decoded.userId,
        status: { in: ['TRIAL', 'SUSPENDED'] }
      }
    })
    
    if (properties.length === 0) {
      return NextResponse.json({ 
        error: 'No se encontraron propiedades pendientes de pago' 
      }, { status: 400 })
    }
    
    // Calculate base price (excluding free property)
    const activePropertiesCount = await prisma.property.count({
      where: {
        hostId: decoded.userId,
        status: 'ACTIVE'
      }
    })
    
    const billableProperties = properties.length
    const pricePerProperty = activePropertiesCount + billableProperties >= 10 ? 2.00 : 2.50
    const baseAmount = billableProperties * pricePerProperty * months
    
    let finalAmount = baseAmount
    let discountAmount = 0
    let appliedCoupon = null
    
    // Apply coupon if provided
    if (couponCode) {
      const validationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': `auth-token=${token}`
        },
        body: JSON.stringify({ 
          couponCode, 
          propertyCount: billableProperties,
          duration: months 
        })
      })
      
      if (validationResponse.ok) {
        const validation = await validationResponse.json()
        if (validation.valid && validation.discount) {
          discountAmount = validation.discount.discountAmount
          finalAmount = validation.discount.finalAmount
          appliedCoupon = validation.coupon
        }
      }
    }
    
    // Generate payment reference
    const paymentReference = `ITN${Date.now()}-${user.id.slice(-4).toUpperCase()}`
    
    // Create pending invoice
    const invoice = await prisma.invoice.create({
      data: {
        userId: user.id,
        invoiceNumber: paymentReference,
        amount: baseAmount,
        discountAmount,
        finalAmount,
        status: 'PENDING',
        paymentMethod,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        notes: JSON.stringify({
          properties: properties.map(p => ({ id: p.id, name: p.name })),
          months,
          pricePerProperty,
          couponApplied: appliedCoupon
        })
      }
    })
    
    // Send notification to admin
    const admins = await prisma.admin.findMany({
      where: { isActive: true }
    })
    
    // Create admin activity log
    for (const admin of admins) {
      await prisma.adminActivityLog.create({
        data: {
          adminUserId: admin.id,
          action: 'PAYMENT_REQUEST_RECEIVED',
          targetType: 'invoice',
          targetId: invoice.id,
          description: `Nueva solicitud de pago de ${user.name} por €${finalAmount}`,
          metadata: {
            userId: user.id,
            propertyCount: properties.length,
            paymentMethod,
            couponCode: appliedCoupon?.code
          }
        }
      })
    }
    
    // Create user notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'PAYMENT_REQUESTED',
        title: 'Solicitud de pago enviada',
        message: `Tu solicitud de pago por €${finalAmount} ha sido enviada. Te contactaremos pronto con las instrucciones.`,
        data: {
          invoiceId: invoice.id,
          paymentReference,
          amount: finalAmount,
          paymentMethod
        }
      }
    })
    
    // Prepare payment instructions
    const paymentInstructions = {
      reference: paymentReference,
      amount: finalAmount,
      method: paymentMethod,
      instructions: paymentMethod === 'BIZUM' 
        ? {
            phone: '612345678',
            concept: paymentReference,
            note: 'Indica el código de referencia en el concepto'
          }
        : {
            iban: 'ES21 1234 5678 9012 3456 7890',
            beneficiary: 'Itineramio S.L.',
            concept: paymentReference,
            note: 'Importante: incluye el código de referencia'
          }
    }
    
    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        reference: paymentReference,
        amount: finalAmount,
        originalAmount: baseAmount,
        discount: discountAmount,
        dueDate: invoice.dueDate
      },
      paymentInstructions,
      message: 'Solicitud de pago enviada correctamente. Recibirás un email con las instrucciones detalladas.'
    })
    
  } catch (error) {
    console.error('Error requesting payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}