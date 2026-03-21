import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../../../src/lib/admin-auth'

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAdminAuth(req)
    if (authResult instanceof Response) return authResult

    // Get start of today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [openCount, waitingAdminCount, resolvedTodayCount, totalCount] = await Promise.all([
      prisma.supportTicket.count({
        where: { status: 'OPEN' }
      }),
      prisma.supportTicket.count({
        where: { status: 'WAITING_ADMIN' }
      }),
      prisma.supportTicket.count({
        where: {
          status: 'RESOLVED',
          updatedAt: { gte: todayStart }
        }
      }),
      prisma.supportTicket.count(),
    ])

    return NextResponse.json({
      openCount,
      waitingAdminCount,
      resolvedTodayCount,
      totalCount,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
