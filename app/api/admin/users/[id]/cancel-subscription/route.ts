import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { verifyAdminToken } from '../../../../../../src/lib/admin-auth'

/**
 * POST /api/admin/users/[id]/cancel-subscription
 * Admin endpoint para cancelar la suscripción de un usuario
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación de admin
    const adminToken = request.cookies.get('admin-token')?.value
    if (!adminToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const adminDecoded = verifyAdminToken(adminToken)
    if (!adminDecoded) {
      return NextResponse.json({ error: 'Token de admin inválido' }, { status: 401 })
    }

    const { id: userId } = await params
    const body = await request.json()
    const { reason, immediate = false } = body

    // Buscar suscripción activa del usuario
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: { gte: new Date() }
      },
      include: {
        plan: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'El usuario no tiene suscripción activa para cancelar' },
        { status: 404 }
      )
    }

    // TODO: Stripe integration not yet implemented
    // En el futuro, cuando se integre Stripe, descomentar este código:
    // if (subscription.stripeSubscriptionId) { ... }

    // Preparar información de cancelación
    const cancelationInfo = {
      canceledBy: `admin:${adminDecoded.adminId}`,
      cancelReason: reason || 'Admin canceled',
      canceledAt: new Date().toISOString(),
      willCancelAt: immediate ? null : subscription.endDate?.toISOString()
    }

    // Actualizar estado en nuestra base de datos
    const updateData: any = {
      status: immediate ? 'CANCELED' : 'ACTIVE',
      notes: `CANCELACIÓN (Admin): ${JSON.stringify(cancelationInfo)}\n\n${subscription.notes || ''}`
    }

    if (immediate) {
      updateData.endDate = new Date()
    }

    const updatedSubscription = await prisma.userSubscription.update({
      where: { id: subscription.id },
      data: updateData
    })

    // Registrar actividad en admin log
    await prisma.adminActivityLog.create({
      data: {
        adminUserId: adminDecoded.adminId,
        action: 'SUBSCRIPTION_CANCELED',
        targetType: 'subscription',
        targetId: subscription.id,
        description: `Admin canceló suscripción de ${subscription.user.name} (${subscription.user.email}). Plan: ${subscription.plan?.name || 'Custom'}. Motivo: ${reason || 'No especificado'}`,
        metadata: {
          subscriptionId: subscription.id,
          userId,
          planId: subscription.planId,
          immediate,
          reason
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: immediate
        ? `Suscripción de ${subscription.user.name} cancelada inmediatamente`
        : `Suscripción de ${subscription.user.name} cancelada. Seguirá activa hasta ${subscription.endDate.toLocaleDateString('es-ES')}`,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        endDate: updatedSubscription.endDate,
        willCancelAt: immediate ? null : subscription.endDate
      }
    })

  } catch (error) {
    console.error('Error cancelando suscripción (admin):', error)
    return NextResponse.json(
      { error: 'Error al cancelar suscripción' },
      { status: 500 }
    )
  }
}
