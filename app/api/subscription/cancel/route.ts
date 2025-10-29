import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyToken } from '../../../../src/lib/auth'

/**
 * POST /api/subscription/cancel
 * Cancela la suscripción activa del usuario
 * Funciona tanto para suscripciones de Stripe como manuales
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const body = await request.json()
    const { reason, immediate = false } = body

    // Buscar suscripción activa
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: decoded.userId,
        status: 'ACTIVE',
        endDate: { gte: new Date() }
      },
      include: {
        plan: true
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'No tienes suscripción activa para cancelar' },
        { status: 404 }
      )
    }

    // TODO: Stripe integration not yet implemented
    // En el futuro, cuando se integre Stripe, descomentar este código:
    // if (subscription.stripeSubscriptionId) { ... }

    // Actualizar estado en nuestra base de datos
    const updateData: any = {
      status: immediate ? 'CANCELED' : 'ACTIVE', // Si es inmediato, cancela ya
      cancelAtPeriodEnd: !immediate, // Marcar que se cancelará al final del período (si no es inmediato)
      canceledAt: new Date(), // Fecha en que se solicitó la cancelación
      cancelReason: reason || 'User requested', // Motivo de la cancelación
      notes: `CANCELACIÓN solicitada por usuario el ${new Date().toLocaleDateString('es-ES')}. ${immediate ? 'Inmediata' : 'Al final del período'}${reason ? `. Motivo: ${reason}` : ''}\n\n${subscription.notes || ''}`
    }

    // Si es cancelación inmediata, establecer la fecha de fin a ahora
    if (immediate) {
      updateData.endDate = new Date()
      updateData.cancelAtPeriodEnd = false // No esperará al final del período
    }

    const updatedSubscription = await prisma.userSubscription.update({
      where: { id: subscription.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: immediate
        ? 'Suscripción cancelada inmediatamente'
        : `Suscripción cancelada. Seguirá activa hasta ${subscription.endDate.toLocaleDateString('es-ES')}`,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        endDate: updatedSubscription.endDate,
        willCancelAt: immediate ? null : subscription.endDate
      }
    })

  } catch (error) {
    console.error('Error cancelando suscripción:', error)
    return NextResponse.json(
      { error: 'Error al cancelar suscripción' },
      { status: 500 }
    )
  }
}
