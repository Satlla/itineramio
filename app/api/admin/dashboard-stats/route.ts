import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import { requireAdmin } from '../../../../src/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdmin(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    const [
      totalUsers,
      activeUsers,
      totalProperties,
      pendingInvoices,
      recentActivity
    ] = await Promise.all([
      // Total de usuarios
      prisma.user.count(),
      
      // Usuarios activos
      prisma.user.count({
        where: { isActive: true }
      }),
      
      // Total de propiedades
      prisma.property.count(),
      
      // Facturas pendientes (será 0 hasta que implementemos el sistema)
      0,
      
      // Actividad reciente
      prisma.adminActivityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: { name: true, email: true }
          }
        }
      })
    ]);

    // Calcular revenue mensual (simulado por ahora)
    const monthlyRevenue = 0; // TODO: Implementar cuando tengamos facturas

    const stats = {
      totalUsers,
      activeUsers,
      totalProperties,
      pendingInvoices,
      monthlyRevenue,
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        action: activity.action,
        description: activity.description || `${activity.action} by ${activity.admin.name}`,
        createdAt: activity.createdAt.toISOString()
      }))
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}