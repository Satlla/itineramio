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
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const users = await prisma.user.findMany({
      where,
      include: {
        properties: {
          select: {
            id: true,
            name: true
          }
        },
        subscriptions: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            plan: {
              select: {
                id: true,
                name: true,
                priceMonthly: true
              }
            }
          },
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      companyName: user.companyName,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      status: user.status,
      subscription: user.subscription,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString(),
      notes: user.notes,
      properties: user.properties,
      currentSubscription: user.subscriptions[0] || null
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      total: formattedUsers.length,
      active: formattedUsers.filter(u => u.isActive).length,
      admins: formattedUsers.filter(u => u.isAdmin).length
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdmin(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    const { 
      email, 
      name, 
      phone, 
      companyName, 
      password,
      planId,
      notes 
    } = await request.json();

    // Validations
    if (!email || !name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and name are required' 
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'User with this email already exists' 
      }, { status: 400 });
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        phone: phone || null,
        companyName: companyName || null,
        password: password || null, // TODO: Hash password properly
        notes: notes || null,
        isActive: true,
        status: 'ACTIVE'
        // createdBy removed - will implement when auth is ready
      }
    });

    // Create subscription if plan provided
    if (planId) {
      await prisma.userSubscription.create({
        data: {
          userId: newUser.id,
          planId,
          status: 'ACTIVE',
          startDate: new Date()
          // createdBy removed - will implement when auth is ready
        }
      });
    }

    // Log activity using the authenticated admin user
    await prisma.adminActivityLog.create({
      data: {
        adminUserId: authResult.userId,
        action: 'user_created',
        targetType: 'user',
        targetId: newUser.id,
        description: `Created user ${email}`,
        metadata: { planId, hasPhone: !!phone, hasCompany: !!companyName }
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        isActive: newUser.isActive
      },
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}