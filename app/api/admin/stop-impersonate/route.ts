import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()

    // Obtener información de la impersonation actual
    const impersonationCookie = cookieStore.get('admin-impersonation')

    if (!impersonationCookie) {
      return NextResponse.json(
        { error: 'No hay impersonation activa' },
        { status: 400 }
      )
    }

    let impersonationData
    try {
      impersonationData = JSON.parse(impersonationCookie.value)
    } catch (error) {
      return NextResponse.json(
        { error: 'Datos de impersonation inválidos' },
        { status: 400 }
      )
    }

    // Crear log de auditoría
    await prisma.adminAuditLog.create({
      data: {
        adminId: impersonationData.adminId,
        adminName: impersonationData.adminName,
        adminEmail: impersonationData.adminEmail,
        targetUserId: impersonationData.targetUserId,
        targetUserEmail: impersonationData.targetUserEmail,
        targetUserName: impersonationData.targetUserName,
        action: 'IMPERSONATE_END',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: {
          duration: Date.now() - new Date(impersonationData.startedAt).getTime(),
          endedAt: new Date().toISOString()
        }
      }
    })

    // Limpiar cookies
    cookieStore.delete('auth-token')
    cookieStore.delete('admin-impersonation')

    console.log(`✅ Admin ${impersonationData.adminEmail} terminó de suplantar a ${impersonationData.targetUserEmail}`)

    return NextResponse.json({
      success: true,
      message: 'Impersonation terminada',
      redirectTo: '/admin/users'
    })
  } catch (error) {
    console.error('Error deteniendo impersonation:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
