import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import {
  requireSuperAdmin,
  hashAdminPassword,
  verifyAdminPassword,
  createActivityLog,
  getRequestInfo
} from '../../../../src/lib/admin-auth'
import { ALL_PERMISSIONS, DEFAULT_ADMIN_PERMISSIONS } from '../../../../src/lib/permissions'

// GET - Listar todos los administradores
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireSuperAdmin(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where: Record<string, unknown> = {}

    if (!includeInactive) {
      where.isActive = true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const administrators = await prisma.admin.findMany({
      where,
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
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      administrators: administrators.map(admin => ({
        ...admin,
        activityCount: admin._count.activityLogs,
        _count: undefined,
      })),
      total: administrators.length,
    })

  } catch (error) {
    console.error('Error fetching administrators:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// POST - Crear nuevo administrador
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireSuperAdmin(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const { email, name, password, role, permissions, confirmPassword } = await request.json()

    // Validaciones
    if (!email || !name || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email, nombre y contraseña son obligatorios'
      }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({
        success: false,
        error: 'La contraseña debe tener al menos 8 caracteres'
      }, { status: 400 })
    }

    // Validar rol
    const validRoles = ['ADMIN', 'SUPER_ADMIN']
    const adminRole = validRoles.includes(role) ? role : 'ADMIN'

    // Si se crea un SUPER_ADMIN, verificar contraseña de confirmación
    if (adminRole === 'SUPER_ADMIN') {
      if (!confirmPassword) {
        return NextResponse.json({
          success: false,
          error: 'Se requiere confirmación de contraseña para crear un Super Admin'
        }, { status: 400 })
      }

      // Obtener admin actual y verificar su contraseña
      const currentAdmin = await prisma.admin.findUnique({
        where: { id: authResult.adminId }
      })

      if (!currentAdmin) {
        return NextResponse.json({
          success: false,
          error: 'Admin actual no encontrado'
        }, { status: 400 })
      }

      const isPasswordValid = await verifyAdminPassword(confirmPassword, currentAdmin.password)
      if (!isPasswordValid) {
        return NextResponse.json({
          success: false,
          error: 'Contraseña de confirmación incorrecta'
        }, { status: 401 })
      }
    }

    // Verificar email único
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    })

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Ya existe un administrador con este email'
      }, { status: 400 })
    }

    // Validar permisos
    let adminPermissions = permissions || DEFAULT_ADMIN_PERMISSIONS
    if (adminRole === 'SUPER_ADMIN') {
      adminPermissions = ALL_PERMISSIONS
    } else if (Array.isArray(permissions)) {
      adminPermissions = permissions.filter((p: string) => ALL_PERMISSIONS.includes(p as typeof ALL_PERMISSIONS[number]))
    }

    // Hashear contraseña
    const hashedPassword = await hashAdminPassword(password)

    // Crear administrador
    const newAdmin = await prisma.admin.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: adminRole,
        permissions: adminPermissions,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        isActive: true,
        createdAt: true,
      }
    })

    // Crear log de actividad
    const { ipAddress, userAgent } = getRequestInfo(request)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'admin_created',
      targetType: 'admin',
      targetId: newAdmin.id,
      description: `Administrador creado: ${newAdmin.name} (${newAdmin.email})`,
      metadata: {
        newAdminEmail: newAdmin.email,
        newAdminRole: newAdmin.role,
        permissionsCount: (newAdmin.permissions as string[]).length
      },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({
      success: true,
      administrator: newAdmin,
      message: 'Administrador creado exitosamente'
    })

  } catch (error) {
    console.error('Error creating administrator:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
