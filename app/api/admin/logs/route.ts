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
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const action = searchParams.get('action');
    const targetType = searchParams.get('targetType');
    const dateRange = searchParams.get('dateRange');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    
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
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await prisma.adminActivityLog.count({ where });

    const formattedLogs = logs.map(log => ({
      id: log.id,
      adminUserId: log.adminUserId,
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId,
      description: log.description,
      metadata: log.metadata,
      createdAt: log.createdAt.toISOString(),
      admin: log.admin
    }));

    return NextResponse.json({
      success: true,
      logs: formattedLogs,
      total: totalCount,
      limit,
      offset,
      hasMore: offset + limit < totalCount
    });

  } catch (error) {
    console.error('Error fetching admin logs:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    const { 
      action,
      targetType,
      targetId,
      description,
      metadata 
    } = await request.json();

    // Validations
    if (!action || !targetType || !targetId || !description) {
      return NextResponse.json({ 
        success: false, 
        error: 'action, targetType, targetId and description are required' 
      }, { status: 400 });
    }

    // Find an admin user for now - in a real implementation, get from auth
    const adminUser = await prisma.user.findFirst({
      where: { isAdmin: true },
      select: { id: true }
    });

    if (!adminUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'No admin user found' 
      }, { status: 400 });
    }

    // Create log entry
    const newLog = await prisma.adminActivityLog.create({
      data: {
        adminUserId: adminUser.id,
        action,
        targetType,
        targetId,
        description,
        metadata: metadata || {}
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      log: {
        id: newLog.id,
        adminUserId: newLog.adminUserId,
        action: newLog.action,
        targetType: newLog.targetType,
        targetId: newLog.targetId,
        description: newLog.description,
        metadata: newLog.metadata,
        createdAt: newLog.createdAt.toISOString(),
        admin: newLog.admin
      },
      message: 'Log entry created successfully'
    });

  } catch (error) {
    console.error('Error creating admin log:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}