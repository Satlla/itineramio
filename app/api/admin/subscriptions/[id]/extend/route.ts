import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth, createActivityLog, getRequestInfo } from '@/lib/admin-auth'

/**
 * POST /api/admin/subscriptions/[id]/extend
 * Extiende una suscripción por X días (gratis)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const { id } = await params
    const body = await request.json()
    const { days = 30, reason = 'Cortesía admin' } = body

    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Los días deben estar entre 1 y 365' },
        { status: 400 }
      )
    }

    // Get subscription
    const subscription = await prisma.userSubscription.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        plan: { select: { name: true } }
      }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Suscripción no encontrada' }, { status: 404 })
    }

    // Calculate new end date
    const currentEndDate = subscription.endDate || new Date()
    const newEndDate = new Date(currentEndDate)
    newEndDate.setDate(newEndDate.getDate() + days)

    // Update subscription
    const updatedSubscription = await prisma.userSubscription.update({
      where: { id },
      data: {
        endDate: newEndDate,
        status: 'ACTIVE', // Reactivate if it was canceled
        cancelAtPeriodEnd: false, // Remove cancellation mark
        notes: `${subscription.notes || ''}\n\n[ADMIN] Extensión de ${days} días el ${new Date().toLocaleDateString('es-ES')}. Motivo: ${reason}. Nueva fecha fin: ${newEndDate.toLocaleDateString('es-ES')}`
      }
    })

    // Update user status
    await prisma.user.update({
      where: { id: subscription.userId },
      data: {
        status: 'ACTIVE',
        subscription: subscription.plan?.name?.toUpperCase() || 'ACTIVE'
      }
    })

    // Log the activity
    const { ipAddress, userAgent } = getRequestInfo(request)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'subscription_extended',
      targetType: 'subscription',
      targetId: id,
      description: `Suscripción extendida ${days} días: ${subscription.user?.email}`,
      metadata: { days, reason, previousEndDate: currentEndDate, newEndDate, userId: subscription.userId },
      ipAddress,
      userAgent
    })

    console.log(`✅ Subscription ${id} extended by ${days} days until ${newEndDate.toISOString()}`)

    return NextResponse.json({
      success: true,
      message: `Suscripción extendida ${days} días hasta ${newEndDate.toLocaleDateString('es-ES')}`,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        previousEndDate: currentEndDate,
        newEndDate: newEndDate
      }
    })

  } catch (error) {
    console.error('Error extending subscription:', error)
    return NextResponse.json(
      { error: 'Error al extender suscripción' },
      { status: 500 }
    )
  }
}
