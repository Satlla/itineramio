import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../../../src/lib/admin-auth'

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

    const { months, reason } = await request.json()
    
    if (!months || months < 1 || months > 12) {
      return NextResponse.json({ 
        error: 'Months must be between 1 and 12' 
      }, { status: 400 })
    }

    // Get the property
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (property.status === 'ACTIVE') {
      return NextResponse.json({ error: 'Property is already active' }, { status: 400 })
    }

    // Calculate subscription end date
    const subscriptionEnd = new Date()
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + months)

    // Activate the property
    const updatedProperty = await prisma.property.update({
      where: { id: params.id },
      data: {
        status: 'ACTIVE',
        subscriptionEndsAt: subscriptionEnd,
        lastPaymentDate: new Date(),
        isPublished: true,
        publishedAt: new Date()
      }
    })

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: property.hostId,
        type: 'PROPERTY_ACTIVATED_MANUAL',
        title: '🎉 Propiedad activada',
        message: `Tu propiedad "${property.name}" ha sido activada por el administrador hasta ${subscriptionEnd.toLocaleDateString()}. ${reason ? `Motivo: ${reason}` : ''}`,
        data: {
          propertyId: property.id,
          propertyName: property.name,
          subscriptionEnd: subscriptionEnd.toISOString(),
          activatedBy: 'admin',
          reason: reason || null
        }
      }
    })

    // Log admin activity
    await prisma.adminActivityLog.create({
      data: {
        adminUserId: authResult.adminId,
        action: 'PROPERTY_ACTIVATED_MANUAL',
        targetType: 'property',
        targetId: property.id,
        description: `Propiedad "${property.name}" activada manualmente para ${property.host.name}`,
        metadata: {
          propertyId: property.id,
          propertyName: property.name,
          userId: property.hostId,
          userEmail: property.host.email,
          months,
          subscriptionEnd: subscriptionEnd.toISOString(),
          reason: reason || null
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Propiedad activada por ${months} mes(es). Notificación enviada al usuario.`,
      property: {
        id: updatedProperty.id,
        name: updatedProperty.name,
        status: updatedProperty.status,
        subscriptionEndsAt: updatedProperty.subscriptionEndsAt
      }
    })
    
  } catch (error) {
    console.error('Error activating property:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}