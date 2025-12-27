import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';

// API temporal para hacer admin a un usuario existente
// Úsala con tu email para convertirte en admin
export async function POST(request: NextRequest) {
  try {
    const { email, masterKey } = await request.json();
    
    // Clave maestra temporal (cambia esto por una más segura)
    if (masterKey !== 'itineramio-admin-2024') {
      return NextResponse.json({ error: 'Invalid master key' }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Hacer admin al usuario
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        isAdmin: true,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true
      }
    });

    // Log de la actividad
    await prisma.adminActivityLog.create({
      data: {
        adminUserId: user.id,
        action: 'admin_granted',
        targetType: 'user',
        targetId: user.id,
        description: `Admin privileges granted to ${user.email}`,
        metadata: { masterKeyUsed: true }
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: updatedUser,
      message: 'User is now admin'
    });

  } catch (error) {
    console.error('Error making user admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}