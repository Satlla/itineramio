import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { requireAdminAuth, createActivityLog, getRequestInfo } from '../../../../src/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const action = searchParams.get('action')
    const targetType = searchParams.get('targetType')
    const dateRange = searchParams.get('dateRange')
    const adminFilter = searchParams.get('adminId')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { targetId: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { admin: { name: { contains: search, mode: 'insensitive' } } },
        { admin: { email: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (action && action !== 'all') {
      where.action = action
    }

    if (targetType && targetType !== 'all') {
      where.targetType = targetType
    }

    if (adminFilter) {
      where.adminId = adminFilter
    }

    if (dateRange && dateRange !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(0)
      }

      where.createdAt = {
        gte: startDate
      }
    }

    const logs = await prisma.adminActivityLog.findMany({
      where,
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    const totalCount = await prisma.adminActivityLog.count({ where })

    const formattedLogs = logs.map(log => ({
      id: log.id,
      adminUserId: log.adminId,
      adminId: log.adminId,
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId,
      description: log.description,
      metadata: log.metadata,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt.toISOString(),
      admin: log.admin
    }))

    return NextResponse.json({
      success: true,
      logs: formattedLogs,
      total: totalCount,
      limit,
      offset,
      hasMore: offset + limit < totalCount
    })

  } catch (error) {
    console.error('Error fetching admin logs:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const {
      action,
      targetType,
      targetId,
      description,
      metadata
    } = await request.json()

    if (!action || !description) {
      return NextResponse.json({
        success: false,
        error: 'action and description are required'
      }, { status: 400 })
    }

    const { ipAddress, userAgent } = getRequestInfo(request)

    const newLog = await createActivityLog({
      adminId: authResult.adminId,
      action,
      targetType: targetType || undefined,
      targetId: targetId || undefined,
      description,
      metadata: metadata || {},
      ipAddress,
      userAgent,
    })

    if (!newLog) {
      return NextResponse.json({
        success: false,
        error: 'Error creating log entry'
      }, { status: 500 })
    }

    const logWithAdmin = await prisma.adminActivityLog.findUnique({
      where: { id: newLog.id },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      log: {
        id: logWithAdmin?.id,
        adminId: logWithAdmin?.adminId,
        adminUserId: logWithAdmin?.adminId,
        action: logWithAdmin?.action,
        targetType: logWithAdmin?.targetType,
        targetId: logWithAdmin?.targetId,
        description: logWithAdmin?.description,
        metadata: logWithAdmin?.metadata,
        createdAt: logWithAdmin?.createdAt.toISOString(),
        admin: logWithAdmin?.admin
      },
      message: 'Log entry created successfully'
    })

  } catch (error) {
    console.error('Error creating admin log:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
