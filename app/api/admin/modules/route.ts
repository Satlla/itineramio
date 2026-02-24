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

    const conditions: any[] = []

    if (search) {
      conditions.push({
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    if (moduleFilter) {
      if (moduleFilter === 'MANUALES') {
        // For MANUALES, include users with UserModule OR active subscription OR active trial
        conditions.push({
          OR: [
            { modules: { some: { moduleType: 'MANUALES', isActive: true } } },
            { subscriptions: { some: { status: 'ACTIVE' } } },
            { trialEndsAt: { gt: new Date() } }
          ]
        })
      } else {
        conditions.push({
          modules: {
            some: {
              moduleType: moduleFilter,
              isActive: true
            }
          }
        })
      }
    }

    const where: any = conditions.length > 0 ? { AND: conditions } : {}

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
          subscriptions: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              status: true,
              startDate: true,
              endDate: true,
              plan: {
                select: {
                  name: true,
                  code: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 1
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

    // Formatear datos para el frontend con estado REAL de acceso
    const now = new Date()
    const formattedUsers = users.map(user => {
      const manualesUserModule = user.modules.find(m => m.moduleType === 'MANUALES') || null
      const gestionUserModule = user.modules.find(m => m.moduleType === 'GESTION') || null
      const activeSubscription = user.subscriptions?.[0] || null

      // Compute real Manuales access (same logic as ModuleLimitsService)
      let manualesModule = manualesUserModule
      if (!manualesModule?.isActive) {
        // Check legacy UserSubscription
        if (activeSubscription && activeSubscription.plan) {
          manualesModule = {
            id: activeSubscription.id,
            moduleType: 'MANUALES' as const,
            status: 'ACTIVE',
            isActive: true,
            activatedAt: activeSubscription.startDate,
            expiresAt: activeSubscription.endDate,
            trialEndsAt: null,
            subscriptionPlan: activeSubscription.plan,
            _source: 'subscription' as any
          } as any
        } else if (user.trialEndsAt && new Date(user.trialEndsAt) > now) {
          // Check user-level trial
          manualesModule = {
            id: 'trial-' + user.id,
            moduleType: 'MANUALES' as const,
            status: 'TRIAL',
            isActive: true,
            activatedAt: null,
            expiresAt: user.trialEndsAt,
            trialEndsAt: user.trialEndsAt,
            subscriptionPlan: null,
            _source: 'user_trial' as any
          } as any
        } else if (user.trialEndsAt && new Date(user.trialEndsAt) <= now) {
          // Expired user-level trial
          manualesModule = {
            id: 'trial-expired-' + user.id,
            moduleType: 'MANUALES' as const,
            status: 'EXPIRED',
            isActive: false,
            activatedAt: null,
            expiresAt: user.trialEndsAt,
            trialEndsAt: user.trialEndsAt,
            subscriptionPlan: null,
            _source: 'user_trial' as any
          } as any
        }
      }

      return {
        ...user,
        manualesModule,
        gestionModule: gestionUserModule,
        activeSubscription
      }
    })

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
 * Handles: UserModule records, legacy UserSubscription, and user-level trials
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

    const actions: string[] = []
    let targetUserId = userId
    let targetModuleType = moduleType

    // 1. Try to cancel UserModule record
    if (moduleId) {
      try {
        const userModule = await prisma.userModule.update({
          where: { id: moduleId },
          data: { status: 'CANCELED', isActive: false, canceledAt: new Date() },
          include: { user: { select: { id: true, email: true, name: true } } }
        })
        targetUserId = userModule.user.id
        targetModuleType = userModule.moduleType
        actions.push(`UserModule ${userModule.moduleType} cancelado`)
      } catch {
        // Module not found, continue
      }
    } else if (userId && moduleType) {
      try {
        await prisma.userModule.update({
          where: { userId_moduleType: { userId, moduleType: moduleType as any } },
          data: { status: 'CANCELED', isActive: false, canceledAt: new Date() }
        })
        actions.push(`UserModule ${moduleType} cancelado`)
      } catch {
        // No UserModule record exists, continue
      }
    }

    // 2. For MANUALES, also cancel legacy subscriptions and user trial
    if (targetUserId && targetModuleType === 'MANUALES') {
      // Cancel active subscriptions
      const canceledSubs = await prisma.userSubscription.updateMany({
        where: { userId: targetUserId, status: 'ACTIVE' },
        data: { status: 'CANCELED', canceledAt: new Date() }
      })
      if (canceledSubs.count > 0) {
        actions.push(`${canceledSubs.count} suscripción(es) cancelada(s)`)
      }

      // Clear user-level trial
      const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { trialEndsAt: true }
      })
      if (user?.trialEndsAt) {
        await prisma.user.update({
          where: { id: targetUserId },
          data: { trialEndsAt: new Date(0) } // Set to epoch (expired)
        })
        actions.push('Trial de usuario expirado')
      }
    }

    if (actions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se encontró módulo activo para desactivar' },
        { status: 404 }
      )
    }

    // Get user info for response
    const user = await prisma.user.findUnique({
      where: { id: targetUserId! },
      select: { email: true, name: true }
    })

    // Log de auditoría
    await prisma.adminActivityLog.create({
      data: {
        adminId: adminAuth.adminId,
        action: 'DEACTIVATE_MODULE',
        targetType: 'UserModule',
        targetId: targetUserId || moduleId || 'unknown',
        description: `Desactivado ${targetModuleType} para ${user?.email}: ${actions.join(', ')}`,
        metadata: { userId: targetUserId, moduleType: targetModuleType, actions }
      }
    })

    return NextResponse.json({
      success: true,
      message: `${targetModuleType} desactivado para ${user?.name}`,
      actions
    })
  } catch (error) {
    console.error('Error deactivating module:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
