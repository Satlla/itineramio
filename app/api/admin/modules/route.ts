import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

/**
 * GET /api/admin/modules
 * Listar usuarios con sus módulos activos
 */
export async function GET(request: NextRequest) {
  try {
    const adminAuth = await requireAdminAuth(request)
    if (adminAuth instanceof Response) return adminAuth

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const moduleFilter = searchParams.get('module') as 'MANUALES' | 'GESTION' | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (moduleFilter) {
      where.modules = {
        some: {
          moduleType: moduleFilter,
          isActive: true
        }
      }
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          companyName: true,
          createdAt: true,
          trialEndsAt: true,
          modules: {
            select: {
              id: true,
              moduleType: true,
              status: true,
              isActive: true,
              activatedAt: true,
              expiresAt: true,
              trialEndsAt: true,
              subscriptionPlan: {
                select: {
                  name: true,
                  code: true
                }
              }
            }
          },
          _count: {
            select: {
              properties: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    // Formatear datos para el frontend
    const formattedUsers = users.map(user => ({
      ...user,
      manualesModule: user.modules.find(m => m.moduleType === 'MANUALES') || null,
      gestionModule: user.modules.find(m => m.moduleType === 'GESTION') || null
    }))

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching modules:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/modules
 * Activar módulo para un usuario
 */
export async function POST(request: NextRequest) {
  try {
    const adminAuth = await requireAdminAuth(request)
    if (adminAuth instanceof Response) return adminAuth

    const body = await request.json()
    const { userId, moduleType, planId, trialDays, expiresAt, notes } = body

    if (!userId || !moduleType) {
      return NextResponse.json(
        { success: false, error: 'userId y moduleType son requeridos' },
        { status: 400 }
      )
    }

    if (!['MANUALES', 'GESTION'].includes(moduleType)) {
      return NextResponse.json(
        { success: false, error: 'moduleType debe ser MANUALES o GESTION' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const now = new Date()
    const trialEndsAt = trialDays
      ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)
      : null

    // Crear o actualizar el módulo
    const userModule = await prisma.userModule.upsert({
      where: {
        userId_moduleType: {
          userId,
          moduleType
        }
      },
      create: {
        userId,
        moduleType,
        status: trialDays ? 'TRIAL' : 'ACTIVE',
        isActive: true,
        activatedAt: now,
        subscriptionPlanId: planId || null,
        trialEndsAt,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      },
      update: {
        status: trialDays ? 'TRIAL' : 'ACTIVE',
        isActive: true,
        activatedAt: now,
        subscriptionPlanId: planId || null,
        trialEndsAt,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        canceledAt: null
      }
    })

    // Log de auditoría
    await prisma.adminActivityLog.create({
      data: {
        adminId: adminAuth.adminId,
        action: 'ACTIVATE_MODULE',
        targetType: 'UserModule',
        targetId: userModule.id,
        description: `Activado módulo ${moduleType} para ${user.email}${trialDays ? ` (trial ${trialDays} días)` : ''}`,
        metadata: { userId, moduleType, trialDays, notes }
      }
    })

    return NextResponse.json({
      success: true,
      module: userModule,
      message: `Módulo ${moduleType} activado para ${user.name}`
    })
  } catch (error) {
    console.error('Error activating module:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/modules
 * Desactivar módulo para un usuario
 */
export async function DELETE(request: NextRequest) {
  try {
    const adminAuth = await requireAdminAuth(request)
    if (adminAuth instanceof Response) return adminAuth

    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('moduleId')
    const userId = searchParams.get('userId')
    const moduleType = searchParams.get('moduleType')

    if (!moduleId && (!userId || !moduleType)) {
      return NextResponse.json(
        { success: false, error: 'Se requiere moduleId o (userId + moduleType)' },
        { status: 400 }
      )
    }

    let userModule

    if (moduleId) {
      userModule = await prisma.userModule.update({
        where: { id: moduleId },
        data: {
          status: 'CANCELED',
          isActive: false,
          canceledAt: new Date()
        },
        include: {
          user: { select: { email: true, name: true } }
        }
      })
    } else {
      userModule = await prisma.userModule.update({
        where: {
          userId_moduleType: {
            userId: userId!,
            moduleType: moduleType as 'MANUALES' | 'GESTION'
          }
        },
        data: {
          status: 'CANCELED',
          isActive: false,
          canceledAt: new Date()
        },
        include: {
          user: { select: { email: true, name: true } }
        }
      })
    }

    // Log de auditoría
    await prisma.adminActivityLog.create({
      data: {
        adminId: adminAuth.adminId,
        action: 'DEACTIVATE_MODULE',
        targetType: 'UserModule',
        targetId: userModule.id,
        description: `Desactivado módulo ${userModule.moduleType} para ${userModule.user.email}`
      }
    })

    return NextResponse.json({
      success: true,
      message: `Módulo ${userModule.moduleType} desactivado para ${userModule.user.name}`
    })
  } catch (error) {
    console.error('Error deactivating module:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
