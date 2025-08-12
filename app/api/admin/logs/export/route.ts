import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../src/lib/prisma';
import { requireAdminAuth } from '../../../../../src/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'csv'; // csv, json, xlsx
    const search = searchParams.get('search');
    const action = searchParams.get('action');
    const targetType = searchParams.get('targetType');
    const dateRange = searchParams.get('dateRange');
    const limit = parseInt(searchParams.get('limit') || '1000'); // Max 1000 for export
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { targetId: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (action && action !== 'all') {
      where.action = action;
    }
    
    if (targetType && targetType !== 'all') {
      where.targetType = targetType;
    }
    
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
      
      where.createdAt = {
        gte: startDate
      };
    }
    
    const logs = await prisma.adminActivityLog.findMany({
      where,
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    const formattedLogs = logs.map(log => ({
      id: log.id,
      fecha: log.createdAt.toISOString(),
      fecha_local: log.createdAt.toLocaleString('es-ES'),
      admin_id: log.adminUserId,
      admin_nombre: log.admin?.name || 'N/A',
      admin_email: log.admin?.email || 'N/A',
      accion: log.action,
      tipo_objetivo: log.targetType,
      id_objetivo: log.targetId,
      descripcion: log.description,
      metadata: typeof log.metadata === 'object' ? JSON.stringify(log.metadata) : log.metadata
    }));

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `logs_admin_${timestamp}`;

    if (format === 'json') {
      return new NextResponse(JSON.stringify(formattedLogs, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}.json"`
        }
      });
    }

    if (format === 'csv') {
      const headers = [
        'ID',
        'Fecha',
        'Fecha Local',
        'Admin ID',
        'Admin Nombre',
        'Admin Email',
        'Acción',
        'Tipo Objetivo',
        'ID Objetivo',
        'Descripción',
        'Metadata'
      ];
      
      const csvRows = [
        headers.join(','),
        ...formattedLogs.map(log => [
          log.id,
          `"${log.fecha}"`,
          `"${log.fecha_local}"`,
          log.admin_id,
          `"${log.admin_nombre}"`,
          `"${log.admin_email}"`,
          `"${log.accion}"`,
          `"${log.tipo_objetivo || ''}"`,
          `"${log.id_objetivo || ''}"`,
          `"${log.descripcion?.replace(/"/g, '""') || ''}"`,
          `"${typeof log.metadata === 'string' ? log.metadata.replace(/"/g, '""') : JSON.stringify(log.metadata || {}).replace(/"/g, '""')}"`
        ].join(','))
      ];
      
      const csvContent = csvRows.join('\n');
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`
        }
      });
    }

    // Default to JSON if format not recognized
    return new NextResponse(JSON.stringify({ 
      error: 'Formato no soportado. Use: csv, json' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error exporting logs:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}