import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import { requireAdminAuth } from '../../../../src/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    const [
      totalUsers,
      activeUsers,
      totalProperties,
      pendingInvoices,
      recentActivity,
      recentSubscriptionRequests
    ] = await Promise.all([
      // Total de usuarios
      prisma.user.count(),

      // Usuarios activos
      prisma.user.count({
        where: { isActive: true }
      }),

      // Total de propiedades
      prisma.property.count(),

      // Facturas pendientes
      prisma.subscriptionRequest.count({
        where: { status: 'PENDING' }
      }),

      // Actividad reciente de admin logs
      prisma.adminActivityLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: { name: true, email: true }
          }
        }
      }),

      // Solicitudes de suscripción recientes
      prisma.subscriptionRequest.findMany({
        take: 5,
        orderBy: { requestedAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          },
          plan: {
            select: { name: true }
          }
        }
      })
    ]);

    // Calcular revenue mensual (simulado por ahora)
    const monthlyRevenue = 0; // TODO: Implementar cuando tengamos facturas

    // Combinar actividad reciente de admin logs y solicitudes de suscripción
    const combinedActivity = [
      ...recentActivity.map(activity => ({
        id: activity.id,
        action: activity.action,
        description: activity.description || `${activity.action} by ${activity.admin?.name || 'Admin'}`,
        createdAt: activity.createdAt.toISOString(),
        targetType: activity.targetType,
        targetId: activity.targetId
      })),
      ...recentSubscriptionRequests.map(request => ({
        id: request.id,
        action: 'Nueva Solicitud de Suscripción',
        description: `${request.user.name || request.user.email} solicitó plan ${request.plan?.name || 'desconocido'} - €${Number(request.totalAmount).toFixed(2)} - Estado: ${request.status}`,
        createdAt: request.requestedAt.toISOString(),
        targetType: 'subscription_request',
        targetId: request.id
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)

    const stats = {
      totalUsers,
      activeUsers,
      totalProperties,
      pendingInvoices,
      monthlyRevenue,
      recentActivity: combinedActivity
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}