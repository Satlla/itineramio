import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { getAdminUser } from '../../../../src/lib/admin-auth'
import { signToken } from '../../../../src/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Verificar que el usuario sea admin
    const adminPayload = await getAdminUser(request)

    if (!adminPayload) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener datos del admin
    const admin = await prisma.admin.findUnique({
      where: { id: adminPayload.adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin no encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      )
    }

    // Obtener el usuario a suplantar
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    if (!targetUser) {
      console.error('❌ Usuario no encontrado con ID:', userId)
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Crear log de auditoría
    await prisma.adminAuditLog.create({
      data: {
        adminId: admin.id,
        adminName: admin.name,
        adminEmail: admin.email,
        targetUserId: targetUser.id,
        targetUserEmail: targetUser.email,
        targetUserName: targetUser.name || 'Sin nombre',
        action: 'IMPERSONATE_START',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: {
          adminRole: admin.role,
          timestamp: new Date().toISOString()
        }
      }
    })

    // Crear token JWT para el usuario suplantado
    // Incluimos información del admin que está suplantando
    const tokenPayload = {
      userId: targetUser.id,
      email: targetUser.email,
      role: targetUser.role
    }

    const userToken = signToken(tokenPayload)

    // Establecer cookie con el token del usuario
    const cookieStore = await cookies()

    // Eliminar cookies de sesión existentes
    cookieStore.delete('auth-token')
    cookieStore.delete('admin-token') // Invalidar sesión admin para prevenir reutilización

    // Ahora establecer la nueva cookie del usuario
    cookieStore.set('auth-token', userToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 horas
    })

    // Guardar información de impersonation en cookie separada
    cookieStore.set('admin-impersonation', JSON.stringify({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      targetUserId: targetUser.id,
      targetUserName: targetUser.name,
      targetUserEmail: targetUser.email,
      startedAt: new Date().toISOString()
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 horas
    })

    return NextResponse.json({
      success: true,
      message: 'Impersonation iniciada',
      user: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role
      },
      impersonatedBy: {
        adminId: admin.id,
        adminName: admin.name,
        adminEmail: admin.email
      }
    })
  } catch (error) {
    console.error('Error en impersonation:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
