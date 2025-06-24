import { NextRequest } from 'next/server';
import { prisma } from './prisma';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export async function getAdminFromSession(request: NextRequest): Promise<AdminUser | null> {
  try {
    // Get user ID from session cookie (ajustar según tu sistema de auth actual)
    const sessionCookie = request.cookies.get('session-token');
    if (!sessionCookie) {
      return null;
    }

    // Decodificar token y obtener user ID (ajustar según tu implementación)
    const userId = await decodeSessionToken(sessionCookie.value);
    if (!userId) {
      return null;
    }

    // Verificar que el usuario es admin
    const user = await prisma.user.findUnique({
      where: { 
        id: userId,
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

    return user;
  } catch (error) {
    console.error('Error getting admin from session:', error);
    return null;
  }
}

export async function requireAdmin(request: NextRequest): Promise<AdminUser> {
  const admin = await getAdminFromSession(request);
  if (!admin) {
    throw new Error('ADMIN_REQUIRED');
  }
  return admin;
}

// TODO: Implementar según tu sistema de autenticación actual
async function decodeSessionToken(token: string): Promise<string | null> {
  // Esta función debe adaptarse a tu sistema de autenticación actual
  // Por ahora, retornamos null para que implementes la lógica específica
  return null;
}

export async function logAdminActivity(
  adminUserId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  description?: string,
  metadata?: any
) {
  try {
    await prisma.adminActivityLog.create({
      data: {
        adminUserId,
        action,
        targetType,
        targetId,
        description,
        metadata: metadata || {}
      }
    });
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
}