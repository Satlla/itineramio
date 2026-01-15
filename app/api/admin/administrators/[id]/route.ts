import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import {
  requireSuperAdmin,
  hashAdminPassword,
  createActivityLog,
  getRequestInfo
} from '../../../../../src/lib/admin-auth'
import { ALL_PERMISSIONS } from '../../../../../src/lib/permissions'

// GET - Obtener un administrador por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireSuperAdmin(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const { id } = await params

    const administrator = await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            activityLogs: true,
            auditLogs: true,
          }
        }
      }
    })

    if (!administrator) {
      return NextResponse.json({
        success: false,
        error: 'Administrador no encontrado'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      administrator: {
        ...administrator,
        activityCount: administrator._count.activityLogs,
        auditCount: administrator._count.auditLogs,
        _count: undefined,
      }
    })

  } catch (error) {
    console.error('Error fetching administrator:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// PUT - Actualizar un administrador
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireSuperAdmin(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const { id } = await params
    const { email, name, password, role, permissions, isActive } = await request.json()

    // Verificar que existe
    const existingAdmin = await prisma.admin.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, permissions: true }
    })

    if (!existingAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Administrador no encontrado'
      }, { status: 404 })
    }

    // No permitir desactivar al propio usuario
    if (id === authResult.adminId && isActive === false) {
      return NextResponse.json({
        success: false,
        error: 'No puedes desactivar tu propia cuenta'
      }, { status: 400 })
    }

    // Si cambia el email, verificar que no exista
    if (email && email !== existingAdmin.email) {
      const emailExists = await prisma.admin.findUnique({
        where: { email }
      })
      if (emailExists) {
        return NextResponse.json({
          success: false,
          error: 'Ya existe un administrador con este email'
        }, { status: 400 })
      }
    }

    // Preparar datos de actualización
    const updateData: Record<string, unknown> = {}

    if (email) updateData.email = email
    if (name) updateData.name = name
    if (typeof isActive === 'boolean') updateData.isActive = isActive

    // Validar rol
    if (role) {
      const validRoles = ['ADMIN', 'SUPER_ADMIN']
      if (validRoles.includes(role)) {
        updateData.role = role
      }
    }

    // Validar y actualizar permisos
    if (permissions !== undefined) {
      const newRole = (updateData.role as string) || existingAdmin.role
      if (newRole === 'SUPER_ADMIN') {
        updateData.permissions = ALL_PERMISSIONS
      } else if (Array.isArray(permissions)) {
        updateData.permissions = permissions.filter((p: string) =>
          ALL_PERMISSIONS.includes(p as typeof ALL_PERMISSIONS[number])
        )
      }
    }

    // Si hay nueva contraseña, hashearla
    if (password && password.length >= 8) {
      updateData.password = await hashAdminPassword(password)
    }

    // Actualizar
    const updatedAdmin = await prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        isActive: true,
        updatedAt: true,
      }
    })

    // Crear log de actividad
    const { ipAddress, userAgent } = getRequestInfo(request)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'admin_updated',
      targetType: 'admin',
      targetId: updatedAdmin.id,
      description: `Administrador actualizado: ${updatedAdmin.name} (${updatedAdmin.email})`,
      metadata: {
        changes: Object.keys(updateData).filter(k => k !== 'password'),
        previousEmail: existingAdmin.email,
        newEmail: updatedAdmin.email,
        previousRole: existingAdmin.role,
        newRole: updatedAdmin.role,
      },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({
      success: true,
      administrator: updatedAdmin,
      message: 'Administrador actualizado exitosamente'
    })

  } catch (error) {
    console.error('Error updating administrator:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// DELETE - Eliminar (desactivar) un administrador
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireSuperAdmin(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const { id } = await params

    // No permitir eliminarse a sí mismo
    if (id === authResult.adminId) {
      return NextResponse.json({
        success: false,
        error: 'No puedes eliminar tu propia cuenta'
      }, { status: 400 })
    }

    // Verificar que existe
    const existingAdmin = await prisma.admin.findUnique({
      where: { id },
      select: { id: true, email: true, name: true }
    })

    if (!existingAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Administrador no encontrado'
      }, { status: 404 })
    }

    // En lugar de eliminar, desactivamos
    await prisma.admin.update({
      where: { id },
      data: { isActive: false }
    })

    // Crear log de actividad
    const { ipAddress, userAgent } = getRequestInfo(request)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'admin_deleted',
      targetType: 'admin',
      targetId: id,
      description: `Administrador eliminado: ${existingAdmin.name} (${existingAdmin.email})`,
      metadata: {
        deletedAdminEmail: existingAdmin.email,
        deletedAdminName: existingAdmin.name,
      },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({
      success: true,
      message: 'Administrador eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting administrator:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
