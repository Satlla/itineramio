import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { getAdminUser } from '../../../../src/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    // Verificar que el usuario sea admin
    const adminPayload = await getAdminUser(request)

    if (!adminPayload) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const action = searchParams.get('action') || undefined
    const adminId = searchParams.get('adminId') || undefined
    const targetUserId = searchParams.get('targetUserId') || undefined
    const propertyId = searchParams.get('propertyId') || undefined

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    if (action) where.action = action
    if (adminId) where.adminId = adminId
    if (targetUserId) where.targetUserId = targetUserId
    if (propertyId) where.propertyId = propertyId

    // Obtener logs con paginación
    const [logs, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      }),
      prisma.adminAuditLog.count({ where })
    ])

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
