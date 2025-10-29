import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { verifyToken } from '../../../../../src/lib/auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 })
    }
    
    const decoded = verifyToken(token)
    
    // Get the property
    const property = await prisma.property.findUnique({
      where: { 
        id: params.id,
        hostId: decoded.userId
      }
    })
    
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }
    
    // Check if property is already in trial or active
    if (property.status === 'TRIAL' || property.status === 'ACTIVE') {
      return NextResponse.json({ 
        error: 'Esta propiedad ya está activa o en período de prueba' 
      }, { status: 400 })
    }
    
    // Check user's property count
    const activePropertiesCount = await prisma.property.count({
      where: {
        hostId: decoded.userId,
        status: { in: ['ACTIVE', 'TRIAL'] }
      }
    })
    
    // If user has no active properties, this is their free property
    if (activePropertiesCount === 0) {
      // First property is completely free - no trial needed
      await prisma.property.update({
        where: { id: params.id },
        data: {
          status: 'ACTIVE',
          isPublished: true,
          publishedAt: new Date()
        }
      })
      
      return NextResponse.json({
        success: true,
        status: 'ACTIVE',
        message: '¡Tu primera propiedad está activa! Es completamente gratuita.',
        requiresPayment: false
      })
    }
    
    // Additional properties need trial period
    const now = new Date()
    const trialEnd = new Date(now)
    trialEnd.setHours(trialEnd.getHours() + 48) // 48 hours trial
    
    // Activate trial period
    await prisma.property.update({
      where: { id: params.id },
      data: {
        status: 'TRIAL',
        trialStartsAt: now,
        trialEndsAt: trialEnd,
        isPublished: true,
        publishedAt: property.publishedAt || now,
        // Reset notification flags
        trialNotified24h: false,
        trialNotified6h: false,
        trialNotified1h: false
      }
    })
    
    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: decoded.userId,
        type: 'TRIAL_STARTED',
        title: 'Período de prueba activado',
        message: `Tu propiedad "${property.name}" está en período de prueba por 48 horas. Después necesitarás activar un plan de pago.`,
        data: {
          propertyId: property.id,
          trialEndsAt: trialEnd.toISOString()
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      status: 'TRIAL',
      message: 'Período de prueba de 48 horas activado',
      trialEndsAt: trialEnd,
      requiresPayment: true,
      monthlyFee: 2.50,
      paymentInfo: {
        bizum: '612345678',
        transfer: 'ES21 1234 5678 9012 3456 7890'
      }
    })
    
  } catch (error) {
    console.error('Error activating trial:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}