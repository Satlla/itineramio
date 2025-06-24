import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../src/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Implement requireAdmin(request) when auth is ready
    
    const { id: userId } = await params;
    const { 
      email, 
      name, 
      phone, 
      companyName, 
      planId, 
      notes,
      isAdmin,
      isActive 
    } = await request.json();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          include: { plan: true },
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!existingUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Check if email is already taken by another user
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });
      
      if (emailExists) {
        return NextResponse.json({ 
          success: false, 
          error: 'Email already exists' 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {
      ...(email && { email }),
      ...(name && { name }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(companyName !== undefined && { companyName: companyName || null }),
      ...(notes !== undefined && { notes: notes || null }),
      ...(typeof isAdmin === 'boolean' && { isAdmin }),
      ...(typeof isActive === 'boolean' && { 
        isActive,
        status: isActive ? 'ACTIVE' : 'SUSPENDED'
      })
    };

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        subscriptions: {
          include: { plan: true },
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        properties: {
          select: { id: true, name: true }
        }
      }
    });

    // Handle plan assignment if provided
    if (planId !== undefined) {
      if (planId === '') {
        // Remove current subscription
        if (existingUser.subscriptions.length > 0) {
          await prisma.userSubscription.update({
            where: { id: existingUser.subscriptions[0].id },
            data: { 
              status: 'CANCELLED',
              endDate: new Date()
            }
          });
        }
      } else {
        // Check if plan exists
        const plan = await prisma.subscriptionPlan.findUnique({
          where: { id: planId }
        });

        if (!plan) {
          return NextResponse.json({ 
            success: false, 
            error: 'Plan not found' 
          }, { status: 400 });
        }

        // Cancel existing subscription
        if (existingUser.subscriptions.length > 0) {
          await prisma.userSubscription.update({
            where: { id: existingUser.subscriptions[0].id },
            data: { 
              status: 'CANCELLED',
              endDate: new Date()
            }
          });
        }

        // Create new subscription
        await prisma.userSubscription.create({
          data: {
            userId: userId,
            planId: planId,
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            customPrice: null
          }
        });
      }
    }

    // Log activity
    const changes = [];
    if (email && email !== existingUser.email) changes.push(`email: ${existingUser.email} → ${email}`);
    if (name && name !== existingUser.name) changes.push(`name: ${existingUser.name} → ${name}`);
    if (typeof isActive === 'boolean' && isActive !== existingUser.isActive) {
      changes.push(`status: ${existingUser.isActive ? 'active' : 'inactive'} → ${isActive ? 'active' : 'inactive'}`);
    }
    if (typeof isAdmin === 'boolean' && isAdmin !== existingUser.isAdmin) {
      changes.push(`admin: ${existingUser.isAdmin} → ${isAdmin}`);
    }
    if (planId !== undefined) {
      const oldPlan = existingUser.subscriptions.length > 0 ? existingUser.subscriptions[0].plan.name : 'No plan';
      if (planId === '') {
        changes.push(`plan: ${oldPlan} → No plan`);
      } else {
        const newPlan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
        changes.push(`plan: ${oldPlan} → ${newPlan?.name || 'Unknown'}`);
      }
    }

    await prisma.adminActivityLog.create({
      data: {
        adminUserId: 'admin', // TODO: Get actual admin ID
        action: 'user_updated',
        targetType: 'user',
        targetId: userId,
        description: `Updated user ${updatedUser.email}: ${changes.join(', ')}`,
        metadata: { 
          changes,
          userEmail: updatedUser.email
        }
      }
    });

    // Fetch updated user with all relationships
    const finalUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          include: { plan: true },
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        properties: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      user: finalUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Implement requireAdmin(request) when auth is ready
    
    const { id: userId } = await params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Check if user has properties (prevent deletion if they do)
    const propertiesCount = await prisma.property.count({
      where: { hostId: userId }
    });

    if (propertiesCount > 0) {
      return NextResponse.json({ 
        success: false, 
        error: `Cannot delete user with ${propertiesCount} properties. Please transfer or delete properties first.` 
      }, { status: 400 });
    }

    // Delete user (this will cascade delete subscriptions, etc.)
    await prisma.user.delete({
      where: { id: userId }
    });

    // Log activity
    await prisma.adminActivityLog.create({
      data: {
        adminUserId: 'admin', // TODO: Get actual admin ID
        action: 'user_deleted',
        targetType: 'user',
        targetId: userId,
        description: `Deleted user ${user.email} (${user.name})`,
        metadata: { 
          userEmail: user.email,
          userName: user.name
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}