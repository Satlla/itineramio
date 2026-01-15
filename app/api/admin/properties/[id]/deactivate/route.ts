import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAdminAuth, createActivityLog, getRequestInfo } from '../../../../../../src/lib/admin-auth'
import { sendEmail, emailTemplates } from '../../../../../../src/lib/email-improved'

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

    const { reason } = await request.json()
    
    if (!reason || reason.trim().length < 3) {
      return NextResponse.json({ 
        error: 'Reason must be at least 3 characters long' 
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

    if (property.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Property is not active' }, { status: 400 })
    }

    // Deactivate the property
    const updatedProperty = await prisma.property.update({
      where: { id: params.id },
      data: {
        status: 'INACTIVE',
        isPublished: false,
        publishedAt: null
      }
    })

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: property.hostId,
        type: 'PROPERTY_DEACTIVATED',
        title: '❌ Propiedad desactivada',
        message: `Tu propiedad "${property.name}" ha sido desactivada por el administrador. Motivo: ${reason}`,
        data: {
          propertyId: property.id,
          propertyName: property.name,
          reason: reason,
          deactivatedBy: 'admin'
        }
      }
    })

    // Send email notification
    try {
      const emailContent = emailTemplates.propertyDeactivated({
        userName: property.host.name || 'Usuario',
        propertyName: property.name,
        reason: reason,
        deactivatedBy: 'admin'
      })

      await sendEmail({
        to: property.host.email,
        subject: `❌ Propiedad desactivada - ${property.name}`,
        html: emailContent
      })
    } catch (emailError) {
      console.error('Error sending deactivation email:', emailError)
      // Don't fail the deactivation process if email fails
    }

    // Log admin activity
    try {
      const { ipAddress, userAgent } = getRequestInfo(request)
      await createActivityLog({
        adminId: authResult.adminId,
        action: 'PROPERTY_DEACTIVATED',
        targetType: 'property',
        targetId: property.id,
        description: `Propiedad "${property.name}" desactivada para ${property.host.name}`,
        metadata: {
          propertyId: property.id,
          propertyName: property.name,
          userId: property.hostId,
          userEmail: property.host.email,
          reason: reason
        },
        ipAddress,
        userAgent,
      })
    } catch (logError) {
      console.error('Error creating admin activity log:', logError)
      // Don't fail the deactivation if logging fails
    }

    return NextResponse.json({
      success: true,
      message: `Propiedad desactivada. Notificación y email enviados al usuario.`,
      property: {
        id: updatedProperty.id,
        name: updatedProperty.name,
        status: updatedProperty.status,
        isPublished: updatedProperty.isPublished
      }
    })
    
  } catch (error) {
    console.error('Error deactivating property:', error)
    console.error('Property ID:', params.id)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}