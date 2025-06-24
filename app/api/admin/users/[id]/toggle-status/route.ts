import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../src/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Implement requireAdmin(request) when auth is ready
    
    const { isActive } = await request.json();
    const { id: userId } = await params;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ 
        success: false, 
        error: 'isActive must be a boolean' 
      }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, isActive: true }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        isActive,
        status: isActive ? 'ACTIVE' : 'SUSPENDED'
      },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        status: true
      }
    });

    // Log activity - find an admin user for now
    const adminUser = await prisma.user.findFirst({
      where: { isAdmin: true },
      select: { id: true }
    });
    
    if (adminUser) {
      await prisma.adminActivityLog.create({
        data: {
          adminUserId: adminUser.id,
          action: isActive ? 'user_activated' : 'user_deactivated',
          targetType: 'user',
          targetId: userId,
          description: `${isActive ? 'Activated' : 'Deactivated'} user ${user.email}`,
          metadata: { 
            previousStatus: user.isActive,
            newStatus: isActive,
            userEmail: user.email
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Error toggling user status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}